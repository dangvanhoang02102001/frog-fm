/** @jsxImportSource frog/jsx */

import { Button, Frog, TextInput } from "frog";
import { devtools } from "frog/dev";
// import { neynar } from 'frog/hubs'
import { handle } from "frog/next";
import { serveStatic } from "frog/serve-static";

const app = new Frog({
  assetsPath: "/",
  basePath: "/api",
  // Supply a Hub to enable frame verification.
  // hub: neynar({ apiKey: 'NEYNAR_FROG_FM' })
  title: "Frog Frame",
});

// Uncomment to use Edge Runtime
// export const runtime = 'edge'

app.frame("/", (c) => {
  // Log chi tiết context và các giá trị nhận được
  console.log("--- Request Context (c) ---");
  // Cẩn thận khi log toàn bộ object `c` vì nó có thể rất lớn, đặc biệt là c.req.
  // Log các thuộc tính quan trọng:
  console.log("c:", c);
  console.log("c.url:", c.url);
  console.log("c.buttonValue:", c.buttonValue); // Giá trị của nút được nhấn (nếu có)
  console.log("c.inputText:", c.inputText); // Giá trị từ TextInput (nếu có)
  console.log("c.status:", c.status); // Trạng thái của frame ('initial' hoặc 'response')
  console.log("c.verified:", c.verified); // Trạng thái xác thực frame (nếu bạn cấu hình Hub)
  // Bạn có thể log thêm các phần khác của `c` nếu cần, ví dụ:
  // console.log("c.frameData:", c.frameData); // Dữ liệu frame đã được parse (nếu là POST request)
  // console.log("c.previousState:", c.previousState); // State trước đó (nếu dùng)

  const { buttonValue, inputText, status } = c;
  console.log("Extracted buttonValue from c:", buttonValue);
  console.log("Extracted inputText from c:", inputText);
  console.log("Extracted status from c:", status);

  const fruit = inputText || buttonValue;
  console.log("Calculated fruit (inputText || buttonValue):", fruit);

  try {
    // Tạo JSX cho image
    const imageJsx = (
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
            ? `Nice choice.${fruit ? ` ${fruit.toUpperCase()}!!` : ""}`
            : "Welcome!"}
        </div>
      </div>
    );
    // Optional: Log cấu trúc của JSX nếu bạn nghi ngờ có vấn đề ở đây,
    // tuy nhiên JSX phức tạp có thể khó log dưới dạng JSON.
    // console.log("Generated imageJsx structure (simplified):", {
    //   background: status === "response" ? "gradient" : "black",
    //   text: status === "response" ? `Nice choice with ${fruit}` : "Welcome!",
    // });

    // Tạo mảng các intents (buttons, text input)
    // Sử dụng .filter(Boolean) để loại bỏ các giá trị falsy (như `false` khi `status !== 'response'`)
    // ra khỏi mảng intents, đảm bảo mảng chỉ chứa các component hợp lệ.
    const intentsArray = [
      <TextInput placeholder="Enter custom fruit..." />,
      <Button value="apples">Apples</Button>,
      <Button value="oranges">Oranges</Button>,
      <Button value="bananas">Bananas</Button>,
      status === "response" && <Button.Reset>Reset</Button.Reset>,
    ].filter(Boolean); // Lọc bỏ các giá trị false (ví dụ khi Button.Reset không được thêm)

    // console.log("Generated intentsArray:", intentsArray.map(intent => intent?.tag || String(intent)));

    console.log("--- Attempting to send response with c.res() ---");
    // Trả về response của frame
    return c.res({
      image: imageJsx,
      intents: intentsArray,
    });
  } catch (error: any) {
    // Bắt lỗi cụ thể nếu có trong quá trình tạo image/intents
    console.error("!!! ERROR within app.frame handler !!!");
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    // Trả về một frame lỗi đơn giản để người dùng biết có sự cố
    return c.res({
      image: (
        <div
          style={{
            color: "red",
            display: "flex",
            fontSize: 40,
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            background: "white",
          }}
        >
          An error occurred while processing the frame. Check server logs.
        </div>
      ),
      intents: [<Button.Reset>Try Again</Button.Reset>],
    });
  }
});

// Khởi tạo devtools
// devtools(app, { assetsPath: "/.frog" }); // Bạn có thể dùng dòng này nếu `copy-static` đã chạy và Next.js phục vụ file từ `public`
devtools(app, { assetsPath: "/.frog", serveStatic }); // Hoặc dùng dòng này để Frog tự phục vụ file tĩnh cho devtools

// Export handlers cho Next.js
export const GET = handle(app);
export const POST = handle(app);

// NOTE: That if you are using the devtools and enable Edge Runtime, you will need to copy the devtools
// static assets to the public folder. You can do this by adding a script to your package.json:
// ```json
// {
//   scripts: {
//     "copy-static": "cp -r ./node_modules/frog/_lib/ui/.frog ./public/.frog"
//   }
// }
// ```
// Next, you'll want to set up the devtools to use the correct assets path:
// ```ts
// devtools(app, { assetsPath: '/.frog' })
// ```
