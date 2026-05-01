/**
 * JSON helper. Given a potentially incomplete JSON string, return the parsed object.
 * The string might be missing closing braces, brackets, or other characters like quotation marks.
 * @param string - The string to parse.
 * @returns The parsed object.
 */
export function closeAndParseJson(input: string) {
  let i = 0;
  let output = "";
  const openings: Array<"[" | "{"> = [];
  let inString = false;
  let escaped = false;

  while (i < input.length) {
    const ch = input[i];

    if (escaped) {
      output += ch;
      escaped = false;
      i++;
      continue;
    }

    if (ch === "\\" && inString) {
      output += ch;
      escaped = true;
      i++;
      continue;
    }

    if (ch === '"') {
      output += ch;
      inString = !inString;
      i++;
      continue;
    }

    if (!inString) {
      if (ch === "{" || ch === "[") {
        openings.push(ch);
        output += ch;
      } else if (ch === "}" && openings.at(-1) === "{") {
        openings.pop();
        output += ch;
      } else if (ch === "]" && openings.at(-1) === "[") {
        openings.pop();
        output += ch;
      } else if (ch === "}" || ch === "]") {
        // 多余的右括号 → 丢弃，不写入 output
        i++;
        continue;
      } else {
        output += ch;
      }
    } else {
      output += ch;
    }
    i++;
  }

  // 补全缺失的
  if (inString) output += '"';
  for (let j = openings.length - 1; j >= 0; j--) {
    output += openings[j] === "{" ? "}" : "]";
  }

  try {
    return JSON.parse(output);
  } catch {
    return null;
  }
}
// function test(description: string, input: string, expected: any) {
//   const result = closeAndParseJson(input);
//   const passed = JSON.stringify(result) === JSON.stringify(expected);
//   console.log(`${passed ? "✓" : "✗"} ${description}`);
//   if (!passed) {
//     console.log(`  Input:    ${input}`);
//     console.log(`  Expected: ${JSON.stringify(expected)}`);
//     console.log(`  Got:      ${JSON.stringify(result)}`);
//   }
// }

// // 1. 完整合法的 JSON
// test("完整对象", '{"a":1}', { a: 1 });
// test("完整数组", "[1,2,3]", [1, 2, 3]);
// test("嵌套结构", '{"x":[1,{"y":2}]}', { x: [1, { y: 2 }] });

// // 2. 缺失右括号
// test("缺失对象结束符", '{"a":1', { a: 1 });
// test("缺失数组结束符", "[1,2,3", [1, 2, 3]);
// test("缺失多层结束符", '{"a":[1,2]', { a: [1, 2] });
// test("嵌套缺失", '{"a":{"b":1}', { a: { b: 1 } });

// // 3. 缺失引号（字符串未闭合）
// test("字符串未闭合", '{"a":"hello world', { a: "hello world" });
// test("数组内字符串未闭合", '["hello', ["hello"]);
// test("转义字符后字符串未闭合", '{"a":"hello\\"world', { a: 'hello"world' });
// test("连续转义", '{"a":"\\\\\\"', { a: '\\"' });

// // 4. 字符串内部含括号（不应被匹配）
// test("字符串内有大括号", '{"text":"Hello {world}"}', { text: "Hello {world}" });
// test("字符串内有方括号", '{"text":"[array]"}}', { text: "[array]" }); // 注意输入多一个 }，解析后应为 { text: '[array]' }
// // 上面的输入实际多了个 }，函数会补 } 吗？函数会忽略多余闭合符，最终 JSON 为 {"text":"[array]"}} 非法，返回 null
// // 修正为正确输入：
// test("字符串内有方括号", '{"text":"[array]"}', { text: "[array]" });

// // 5. 转义字符处理
// test("转义双引号在字符串内", '{"a":"he said \\"hello\\""}', {
//   a: 'he said "hello"',
// });
// test("转义反斜线", '{"a":"C:\\\\temp"}', { a: "C:\\temp" });
// test("复杂转义序列", '{"a":"\\n\\t\\r"}', { a: "\n\t\r" });

// // 6. 多余右括号会被忽略（但解析失败则返回 null）
// test("多余右括号 - 对象后多一个 }", '{"a":1}}', { a: 1 }); // 因为最终字符串为 {"a":1}} 非法
// test("多余右括号 - 数组后多一个 ]", "[1,2,3]]", [1, 2, 3]);
// // 但注意：如果多余括号与缺失括号混合，补全后可能恰好合法？比如 {"a":1}] 缺失 } 有冗余 ] -> 补 } 得 {"a":1}]} ？实际上不可预料，返回 null 较安全

// // 7. 空输入 / 仅空白
// test("空字符串", "", null);
// test("空白字符串", "   ", null);
// test("仅有左括号", "{", {}); // 补 } 后成为 {}，是合法空对象
// test("仅有左括号", "{", {}); // 修正：输入 "{" 补 "}" 得 "{}"，解析为 {}
// test("仅有左方括号", "[", []);

// // 8. 边缘情况：字符串内含有未转义的双引号（非法 JSON 输入）
// test("字符串内未转义的双引号", '{"a":"hello"world"}', null); // 语法错误，无法修复

// // 9. 多个未闭合的括号与字符串混合
// test("对象内数组字符串未闭合", '{"a":["b', { a: ["b"] });
// test("深层嵌套未闭合", '{"x":{"y":{"z":[1,2,3]', {
//   x: { y: { z: [1, 2, 3] } },
// });

// // 10. 布尔值、数字、null 截断（函数不修复语义，仅加括号）
// test("数字截断", '{"a":12', { a: 12 });
// test("布尔值截断 true", '{"a":tru', null); // 只补 }, 得 {"a":tru}，非法
// test("null 截断", '{"a":nul', null);

// console.log("测试完成");
