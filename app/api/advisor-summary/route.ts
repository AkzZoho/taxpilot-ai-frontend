import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Generate a structured summary of the conversation
    const summaryResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a tax assistant summarizer. Given a conversation between a user and a tax advisor AI, extract and summarize:
1. Key tax facts discussed (regime preference, deductions used, income details)
2. Recommendations given (investments suggested, deductions to claim, actions to take)
3. User's questions and concerns
4. Action items the user should follow up on

Return a concise, structured summary in plain text. Max 400 words.`,
        },
        {
          role: "user",
          content: `Summarize this tax advisor conversation:\n\n${messages
            .map((m: { role: string; content: string }) => `${m.role.toUpperCase()}: ${m.content}`)
            .join("\n\n")}`,
        },
      ],
      max_tokens: 500,
    });

    const summary = summaryResponse.choices[0]?.message?.content ?? "";

    // Save to tax_analyses table as advisor memory
    const { data: existing } = await supabase
      .from("tax_analyses")
      .select("id")
      .eq("user_id", user.id)
      .eq("assessment_year", "2024-25")
      .single();

    if (existing) {
      await supabase
        .from("tax_analyses")
        .update({ advisor_notes: summary, updated_at: new Date().toISOString() })
        .eq("id", existing.id);
    } else {
      await supabase
        .from("tax_analyses")
        .insert({ user_id: user.id, assessment_year: "2024-25", advisor_notes: summary });
    }

    return NextResponse.json({ success: true, summary });
  } catch (err: unknown) {
    console.error("Summary error:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
