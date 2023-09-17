import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { openai } from "../lib/openai";
import { OpenAIStream, streamToResponse } from "ai";

export async function generateAICompletionRoute(app: FastifyInstance) {
  app.post("/ai/complete", async (request, reply) => {
    const paramsSchema = z.object({
      videoId: z.string(),
      template: z.string(),
      temperature: z.number().min(0).max(10).default(0.5),
    });

    const { temperature, template, videoId } = paramsSchema.parse(
      request.params
    );

    const video = await prisma.video.findUniqueOrThrow({
      where: {
        id: videoId,
      },
    });

    if (!video) {
      return reply.status(400).send("Video not found");
    }

    const promptMessage = template.replace(
      "{transcription}",
      video.transcription ?? ""
    );

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      temperature: temperature,
      messages: [
        {
          role: "user",
          content: promptMessage,
        },
      ],
      stream: true,
    });

    const stream = OpenAIStream(response);

    streamToResponse(stream, reply.raw, {
      headers: {
        "Acess-Control-Allow-Origin": "*",
        "Acess-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      },
    });
  });
}
