const express = require('express');
const bodyParser = require('body-parser');

const app = express();

// const hostname = '10.12.19.75'; // 智园
// const hostname = '10.27.122.110'; //理学院
const hostname = '127.0.0.1';

app.use(bodyParser.json());
app.use(express.static('public'));

app.post('/submit', (req, res) => {
    const data = req.body;
    console.log('data: ', data);
    // 构造文件路径，以 name 决定文件名
    const fileName = `./data/${data.name}.json`;

    // 将数据追加到文件末尾
    fs.appendFile(fileName, JSON.stringify(data, null, 2) + ',\n', (err) => {
        if (err) {
            console.error('追加文件出错:', err);
            return res.status(500).send('保存数据失败');
        }
        console.log('数据已追加到 dataList.json!');
        res.send('数据已接收并保存');
    });
});



const PORT = 3000;
app.listen(PORT,hostname , () => console.log(`服务器运行在 http://${hostname}:${PORT}`));

const cors = require('cors');
app.use(cors());

