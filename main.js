const request = require("superagent"); //发送网络请求获取DOM
const cheerio = require("cheerio"); //能够像Jquery一样方便获取DOM节点
const template = require("art-template"); //模板引擎
// npm install --save-dev babel-polyfill
const path = require("path"); //路径配置
const fs = require("fs"); //文件读写
const nodemailer = require("nodemailer");//邮箱的发送


const MojiUrl = "https://tianqi.moji.com/weather/china/hubei/xishui-county";
const QQme = "https://13469940053.github.io/";
const Oneurl = "http://wufazhuce.com/";
const Love = '我对你的温度是:100度';

//1.认识天数
function getdayDate() {

    return new Promise((resolve, reject) => {
        const today = new Date();

        const meet = new Date("2020-3-9");

        const count = Math.ceil((today - meet) / 1000 / 60 / 60 / 24);
        //格式化当前日期
        const newyear = today.getFullYear() + '年';
        const format = (today.getMonth() + 1) + '月' + today.getDate() + '日';

        const dayDate = {
            count,
            newyear,
            format
        }
        resolve(dayDate);
        // console.log(dayDate);
        // console.log("认识的天数:" + dayDate.count, "认识的时间:" + dayDate.format);
    })
}
getdayDate();

//2.发起请求获取墨迹天气数据
function getMojiDate() {

    return new Promise((resolve, reject) => {
        //请求获取数据
        request.get(MojiUrl).end((err, res) => {
            if (err) return console.log("数据获取失败,请检查路径是否正确！");
            // 官网源代码获取
            // console.log(res.text);
            //把字符串解析成html
            const $ = cheerio.load(res.text);
            //温度
            let Wendu = $(".wea_weather clearfix em").text();
            //天气图标
            const mojiImg = $('.wea_weather span img').attr('src');
            //天气文字
            const mojiwz = $('.wea_weather b').text();
            //提示
            const mojiwzts = $('.wea_tips em').text();
            //人的图形
            const mojiren = $('.wea_info_avator img').attr('src');
            //温度为空请重新查询
            // if (Wendu == null || Wendu ==" " ){
            //      return  console.log("请检查网址******");
            // }else{
            //     Wendu = 10;
            //   console.log("墨迹温度"+Wendu);
            // }
            const mojiDate = {
                Love,
                mojiImg,
                mojiwz,
                mojiwzts,
                mojiren
            }
            resolve(mojiDate);
            // console.log(mojiDate);

        });
    });
}
// getMojiDate();



//2.发起请求获取我的qq链接
function getQQmeDate() {
    //请求获取数据
    return new Promise((resolve, reject) => {
        request.get(QQme).end((err, res) => {
            if (err) return console.log("数据获取失败,请检查路径是否正确！");
            // 官网源代码获取
            // console.log(res.text);
            //把字符串解析成html
            const $ = cheerio.load(res.text);
            //温度
            const QQme = $('.social-link a').eq(2).attr('href');
            // console.log(QQme);
            resolve(QQme);
        });
    })
}
// getQQmeDate();



//3.发起请求获取one数据
function getoneDate() {
    return new Promise((resolve, reject) => {
        //请求获取数据
        request.get(Oneurl).end((err, res) => {
            if (err) return console.log("数据获取失败,请检查路径是否正确！");
            // 官网源代码获取
            //把字符串解析成html
            const $ = cheerio.load(res.text);
            // console.log(res.text);
            const oneImg = $('.carousel-inner>.item>img, .carousel-inner>.item>a>img').attr('src');
            const oneText = $('.fp-one .fp-one-cita-wrapper .fp-one-cita a').eq(0).text();

            const onedate = {
                oneImg,
                oneText
            }
            // console.log(onedate);
            resolve(onedate);
        })

    });

}
// getoneDate();


//4.通过模板引擎替换html数据
async function readerTemplate() {
    //日期 数据
    const dayDate = await getdayDate();
    //天气获取数据
    const MojiDate = await getMojiDate();
    //获取one数据
    const oneDate = await getoneDate();
    //获取我的QQ链接
    const QQme = await getQQmeDate();

    // console.log(dayDate);
    // console.log(MojiDate);
    // console.log(oneDate);
    // console.log(QQme);

    //封装为静态等待发送文件
    return new Promise((resolve, reject) => {
        //引擎数据替换
        const html = template(path.join(__dirname, "./demo.html"), {
            dayDate,
            MojiDate,
            oneDate,
            QQme
        });
        resolve(html);
        // console.log(html);
    });
    //  const savehtml= template(path.join(__filename),"./love.html");
    // fs.writeFile('./love.html',html);
    //console.log(html+"文件保存成功");

}
// readerTemplate();


//发送邮件
async function sendNodeMail() {
    //html 页面内容 通过await等待当前执行完后继续
    const html = await readerTemplate();
    // console.log(html);


    //默认使用smtp传输，创建重用邮箱对象
    let transporter = nodemailer.createTransport({
        host: "smtp.163.com",
        port: 465,
        secure: true,//开启加密协议，需要使用465端口
        auth: {
            user: "13469940053@163.com",//用户名
            pass: "*****"//授权密码
        }
    });
    //设置电子邮件数据
    let mailoptions = {
        from: '"无风不起浪@你" <13469940053@163.com>',//发件人邮箱
        to: "2508723631@qq.com,2358935579@qq.com",//收件人列表(可以多个发送以,分开)
        subject: "I love you！ 5201314 ",//邮件名称标题
        text: "无风不起浪#@你发的邮件", // 纯文本正文
        html: html
    };

    //发送邮件命令 进行判断
    transporter.sendMail(mailoptions, (error, info = {}) => {
        if (error) {
            console.log(error);
            sendNodeMail();//再次发送
        }
        console.log("邮件发送成功！", info.messageId);
        console.log("静静等待下一次发送！");
    });

}
// sendNodeMail();



//定时发送的时间
var schedule = require('node-schedule');
 //6个占位符从左到右分别代表：秒、分、时、日、月、周几  *代表通配符
var j = schedule.scheduleJob('42 * * * * *', function(){
    sendNodeMail();
  console.log('生命、宇宙和一切的答案！发送成功！');
});
