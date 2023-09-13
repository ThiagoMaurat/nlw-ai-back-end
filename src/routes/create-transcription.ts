import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { createReadStream } from "node:fs";
import { openai } from "../lib/openai";

export async function createTranscriptionRoute(app: FastifyInstance) {
  app.post("/videos/:videoId/transcription", async (request, reply) => {
    const paramsSchema = z.object({
      videoId: z.string(),
    });

    const bodySchema = z.object({
      prompt: z.string(),
    });

    const { videoId } = paramsSchema.parse(request.params);

    const { prompt } = bodySchema.parse(request.body);

    const video = await prisma.video.findUniqueOrThrow({
      where: {
        id: videoId,
      },
    });

    const videoPath = video.path;

    const audiotReadStream = createReadStream(videoPath);

    const response = await openai.audio.transcriptions.create({
      file: audiotReadStream,
      model: "whisper1",
      language: "pt",
      response_format: "json",
      temperature: 0,
      prompt,
    });

    return response.text;
  });
}
