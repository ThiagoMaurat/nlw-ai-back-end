import { fastify } from "fastify";
import { getAllPromptsRoute } from "./routes/get-all-prompts";
import { uploadVideoRoute } from "./routes/upload-video";

const app = fastify();

app.register(getAllPromptsRoute);
app.register(uploadVideoRoute);

app.listen({ port: 3333 }, (err, address) => {
  if (err) {
    console.log(err);
    process.exit(1);
  }
  console.log(`Server running at ${address}`);
});
