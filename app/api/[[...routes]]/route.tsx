/** @jsxImportSource frog/jsx */

import { Button, Frog, TextInput } from "frog";
import { devtools } from "frog/dev";
import { handle } from "frog/next";
import { serveStatic } from "frog/serve-static";

const app = new Frog({
  assetsPath: "/",
  basePath: "/api",
  title: "Frog Frame",
  // Add these for better error handling
  // browserLocation: "/",
  imageOptions: {
    width: 1200,
    height: 630,
  },
});

console.log("app: ", app);

// app.hono.get("/test-hono", (c) => {
//   console.log("Hono GET /test-hono inside /api reached!");
//   return c.text("Hono says hi from /api/test-hono");
// });

// console.log("--- Hono Routes ---");
// console.dir(app.hono.routes, { depth: null });
// console.log("--- End Hono Routes ---");

app.frame("/", (c) => {
  try {
    const { buttonValue, inputText, status } = c;
    console.log(
      "buttonValue, inputText, status: ",
      buttonValue,
      inputText,
      status
    );
    // More defensive handling of fruit value
    const fruit = inputText?.trim() || buttonValue || "";

    // Create the response image
    const imageElement = (
      <div
        style={{
          alignItems: "center",
          background:
            status === "response"
              ? "linear-gradient(to right, #432889, #17101F)"
              : "black",
          backgroundSize: "100% 100%",
          display: "flex",
          flexDirection: "column",
          flexWrap: "nowrap",
          height: "100%",
          justifyContent: "center",
          textAlign: "center",
          width: "100%",
        }}
      >
        <div
          style={{
            color: "white",
            fontSize: 60,
            fontStyle: "normal",
            letterSpacing: "-0.025em",
            lineHeight: 1.4,
            marginTop: 30,
            padding: "0 120px",
            whiteSpace: "pre-wrap",
          }}
        >
          {status === "response"
            ? `Nice choice.${fruit ? ` ${fruit.toUpperCase()}!` : ""}`
            : "Welcome!"}
        </div>
      </div>
    );

    // Create intents array - simpler approach
    const intents = [
      <TextInput placeholder="Enter custom fruit..." />,
      <Button value="apples">Apples</Button>,
      <Button value="oranges">Oranges</Button>,
      <Button value="bananas">Bananas</Button>,
    ];

    // Only add reset button if we have a response
    if (status === "response") {
      intents.push(<Button.Reset>Reset</Button.Reset>);
    }

    return c.res({
      image: imageElement,
      intents: intents,
    });
  } catch (error) {
    console.error("Frame handler error:", error);

    // Return a simple error frame
    return c.res({
      image: (
        <div
          style={{
            alignItems: "center",
            background: "red",
            color: "white",
            display: "flex",
            fontSize: 40,
            height: "100%",
            justifyContent: "center",
            textAlign: "center",
            width: "100%",
          }}
        >
          Something went wrong!
        </div>
      ),
      intents: [<Button.Reset>Try Again</Button.Reset>],
    });
  }
});

app.frame("/main", (c) => {
  console.log("MAIN FRAME HIT at /main", c.req.path);
  const { buttonValue, inputText, status } = c;
  const fruit = inputText?.trim() || buttonValue || "";

  let intents = [];
  if (status === "response") {
    // console.log(
    //   "Action received, testing Button.Reset ALONE. ButtonValue:",
    //   buttonValue
    // );
    // intents = [<Button.Reset>Reset</Button.Reset>];
    console.log(
      "Action received, testing a different button. ButtonValue:",
      buttonValue
    );
    intents = [<Button value="nextAction">Next Action</Button>];
  } else {
    // 'initial' status
    intents = [
      <Button value="apples">Apples</Button>, // A single, simple button
    ];
  }

  // Or even simpler for the first test:
  // const intents = [<Button value="test">Test</Button>];

  return c.res({
    /* Your image JSX, make sure it updates based on 'fruit' and 'status' */
    image: (
      <div
        style={{
          color: "white",
          display: "flex",
          fontSize: 60,
          background: "teal",
          height: "100%",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
        }}
      >
        <div>Frame: /main</div>
        <div>Status: {status}</div>
        {fruit && <div>Fruit: {fruit.toUpperCase()}</div>}
        {status === "response" && buttonValue && (
          <div>Clicked: {buttonValue}</div>
        )}
      </div>
    ),
    intents: intents,
  });
});

app.frame("/personal", (c) => {
  console.log("HELLO FRAME HIT", c.req.path);
  return c.res({
    image: (
      <div
        style={{
          color: "black",
          display: "flex",
          fontSize: 60,
          background: "blue",
          height: "100%",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        Hoang Dang
      </div>
    ),
    intents: [<Button>Back to Root</Button>],
  });
});

// Conditional devtools setup
if (process.env.NODE_ENV === "development") {
  devtools(app, { serveStatic });
}

export const GET = handle(app);
export const POST = handle(app);
