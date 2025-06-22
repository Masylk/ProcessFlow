import { NextRequest, NextResponse } from 'next/server';
import { HfInference } from '@huggingface/inference';

const hf = new HfInference(process.env.HUGGING_FACE_HUB_TOKEN);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { bpmn } = body;

    if (!bpmn) {
      return NextResponse.json({ error: 'BPMN content is missing' }, { status: 400 });
    }

    console.log('Received BPMN content, sending to Hugging Face for analysis...');

    const hfResponse = await hf.chatCompletion({
      model: 'mistralai/Mistral-7B-Instruct-v0.2',
      messages: [
        {
          role: 'system',
          content: 'You are an expert in BPMN diagrams. Analyze the following BPMN XML and provide a summary of the process it describes. Describe the main steps, decision points, and the overall flow.',
        },
        {
          role: 'user',
          content: bpmn,
        },
      ],
      max_tokens: 500,
    });

    const analysis = hfResponse.choices[0].message.content;
    console.log('Hugging Face analysis complete.');

    return NextResponse.json({ message: 'BPMN content analyzed successfully', analysis }, { status: 200 });
  } catch (error) {
    console.error('Error processing BPMN content:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 