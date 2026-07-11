/** Convert an async generator of text chunks into a streaming HTTP Response. */
export function textStreamResponse(gen: AsyncGenerator<string>): Response {
  const encoder = new TextEncoder();

  async function* safe(): AsyncGenerator<string> {
    try {
      yield* gen;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      yield `\n\n> ⚠️ เกิดข้อผิดพลาดในการเชื่อมต่อ AI: ${message}\n> ตรวจสอบค่า ANTHROPIC_API_KEY หรือการเชื่อมต่อเครือข่าย`;
    }
  }

  const iterator = safe();
  const stream = new ReadableStream<Uint8Array>({
    async pull(controller) {
      const { value, done } = await iterator.next();
      if (done) {
        controller.close();
        return;
      }
      controller.enqueue(encoder.encode(value));
    },
    async cancel() {
      await iterator.return?.(undefined);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
    },
  });
}
