import axios from "axios";

export async function makeRPCCall(
  url: string,
  method: string,
  error: string
): Promise<string> {
  try {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    const data = {
      jsonrpc: "2.0",
      id: 1,
      method,
    };

    const response = await axios.post(url, data, config);

    return response.data.result;
  } catch {
    return error;
  }
}
