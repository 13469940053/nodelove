"use strict";
const nodemailer = require("nodemailer");

// 异步..在全局范围内不允许等待，必须使用包装
async function main() {
  //从电子邮件生成测试SMTP服务帐户
  // 只有当你没有一个真实的邮件账户来测试时才需要
  let testAccount = await nodemailer.createTestAccount();

  // 使用默认的SMTP传输创建可重用的传输器对象
  let transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // 对于465为真，对于其他端口为假

    auth: {
      user: testAccount.user, // 生成的以太用户
      pass: testAccount.pass // 生成的以太密码
    }
  });

  // 发送带有定义的传输对象的邮件
  let info = await transporter.sendMail({
    from: '"Fred Foo 👻" <foo@example.com>', // 用户
    to: "bar@example.com, baz@example.com", // 收件人
    subject: "Hello ✔", // 主体
    text: "Hello world?", // 纯文本正文
    html: "<b>Hello world?</b>" // 超文本标记语言体
  });

  console.log("Message sent: %s", info.messageId);
  // 发送消息:

  //预览仅在通过Ethereal帐户发送时可用
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  //预览URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}

main().catch(console.error);


// ffcnbvbimpegebcf