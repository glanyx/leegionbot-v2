import Enmap from "enmap";
import Message from "../src/events/message";
import ping from "../src/commands/ping";

jest.mock("../src/commands/ping");

const message = {
  content: ".ping",
  author: {
    bot: false
  }
};

const message2 = {
  content: "ping",
  author: {
    bot: false
  }
};

let client = new Object();
client.commands = new Enmap();
client.commands.set("ping", require("../src/commands/ping"));

describe("LeegionBot", () => {
  test("Missing prefix", () => {
    Message(client, message2);
    expect(ping.run).toBeCalledTimes(0);
  });

  test("Ping pong response", () => {
    Message(client, message);
    expect(ping.run).toBeCalledTimes(1);
  });
});
