import {config} from 'dotenv';
import axios from 'axios'
import {load} from 'cheerio'
import {MongoClient, ServerApiVersion} from 'mongodb';

config()

const hostUrl = {
    notion: 'https://dev-leo.notion.site',
    excRate: 'http://fx.kebhana.com/FER1101M.web',
    naverMob: 'https://m.search.naver.com/search.naver?sm=mtp_hty.top&where=m&query=',
    longShort: 'http://fapi.bybt.com/api/futures/longShortRate?timeType=',
    fearGreed: 'https://api.alternative.me/fng/?limit=30&date_format=kr',
    dominance: 'https://www.coinmarketcap.co.kr/',
    realTime: 'https://test-api.signal.bz/news/realtime',
    majorIndex: 'https://m.stock.naver.com/api/home/majors',
    daumMob: 'https://m.search.daum.net/search?w=tot&nil_mtopsearch=btn&DA=YZR&q=',
    daum: 'https://search.daum.net/search?nil_profile=btn&w=tot&DA=SBC&q=',
    weather2: 'https://m.search.daum.net/search?nil_profile=btn&w=tot&DA=SBC&q=%EC%A0%84%EA%B5%AD+%EB%82%A0%EC%94%A8',
    covid: 'https://api.corona-19.kr/korea/beta/?serviceKey=gH2phQt8EdGF3xaCMOvNZKYBznUlsk519',
    instaTag: 'https://www.tagsfinder.com/ko-kr/ajax/?hashtag=',
    leaderBoard: 'https://coinsect.io/indicators/leaderboard',
    notionDB: 'https://api.notion.com/v1/pages'
}
const mongoUri = process.env.MONGO_URI
const client = new MongoClient(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1
});


export const handler = async (event) => {
    let req = JSON.parse(event['body'])
    try {
        let res = await main(req['fun'], req['room'], req['sender'], req['message'])
        return res
    } catch (e) {
        return e
    }
};

const main = async (fun, room, sender, message) => {
    let res

    switch (fun) {
        case 'test':
            res = test(room, sender, message)
            break
        case 'naverStock':
            res = naverStock(message.slice(2))
            break
        case 'addTodo':
            res = addTodo(room, sender, message.slice(5));
            break
        case 'allTodo':
            res = allTodo(room, sender);
            break
        case 'removeTodo':
            res = removeTodo(room, sender, message.slice(5));
            break
        case 'removeAllTodo':
            res = removeAllTodo(room, sender);
            break
        default:
            res = Promise.reject('no Function')
    }

    return res
}

const test = (room, sender, message) => {

}

// ==================지수 함수==================

const naverStock = (message) => {
    return axios.get(hostUrl.naverMob + message + '+주가')
        .then(v => {
            let json = {}
            let doc = load(v.data)
            let stockNow = doc('div.stock_price').text().split(' ')[1]
            let stockPrice = doc('div.stock_info').text()
            let stockName = doc('div.stock_tlt').text()
            if (isEmpty(stockPrice)) {
                return '네이버 주식에서 조회할 수 없는 주식입니다.😟';
            }

            let price = []
            stockPrice.split(' ').map(v => {
                if (v == '') {

                } else {
                    price.push(v)
                }
            })

            let moneyExp = ' $';

            for (let i = 0; i <= 7; i++) {
                json[price[2 * i]] = price[2 * i + 1]
            }

            let decPoint = json['시가'].split('.')[1];
            if (isEmpty(decPoint)) {
                decPoint = 0
            } else {
                decPoint = decPoint.length
            }

            // price
            const oPrice = removeComma(json['전일종가']);
            let hPrice = removeComma(json['고가']);
            let lPrice = removeComma(json['저가']);
            let cPrice = removeComma(stockNow);
            let volume = json['거래량'];


            // change
            const hPct = ((hPrice / oPrice - 1.0) * 100.0).toFixed(2);
            const lPct = ((lPrice / oPrice - 1.0) * 100.0).toFixed(2);
            const cPct = ((cPrice / oPrice - 1.0) * 100.0).toFixed(2);
            let change = cPrice - oPrice;
            let updw = '';

            // format
            if (0 < change) {
                updw = '🔼';
                change = '+' + change;
            } else if (change < 0) {
                updw = '🔽';
                change = change;
            }

            if (stockName.includes('KOSPI') || stockName.includes('KOSDAQ')) {
                moneyExp = ' 원';
            }

            let tmp = [
                '[' + stockName + ']\n',
                '📈최고가: (' + hPct + '%) ' + refineNum(hPrice, decPoint) + moneyExp,
                '📉최저가: (' + lPct + '%) ' + refineNum(lPrice, decPoint) + moneyExp,
                '📊거래량: ' + volume,
                updw + '등락: (' + cPct + '%) ' + refineNum(change, decPoint) + moneyExp + '\n',
                '💰현재가: ' + refineNum(cPrice, decPoint) + moneyExp,
            ]

            return printArray(tmp, false,false)
        })
}

// ==================투두 함수==================

const addTodo = (room, sender, newTodo) => {
    if (isEmpty(newTodo)) {
        throw '투두추가 실패😟\n추가할 할일들을 띄어쓰기로 구분해 입력해주세요.\n ex) 투두추가 잠자기 밥먹기';
    }
    newTodo = newTodo.trim()
    let output = ''
    return findDB('sender', 'todo', room, sender)
        .then(res => {
            if (res == null) {
                res = {'todo': []}
            }
            newTodo = newTodo.split(' ').map(x => x.trim())
            for (let i of newTodo) {
                let j = i
                if (j == '') {
                    continue
                }
                if (res['todo'].includes(j)) {
                    output += '[' + j + '] 가 ToDo 에 있습니다.\n'
                } else {
                    res['todo'].push(j)
                }
            }
            output += '투두추가 완료🐣\n'
            output += printArray(res['todo'], true, true)
            return res
        })
        .then(res => updateDB('sender', 'todo', room, sender, res))
        .then(() => output)
}

const allTodo = (room, sender) => {
    let output = '🗓️' + sender + '님의 ToDo 목록🗓️\n';
    return findDB('sender', 'todo', room, sender)
        .then(res => {
            if (res == null) {
                throw '등록된 투두가 없습니다.😟'
            }
            output += printArray(res['todo'], true, true)
            return output
        })
}

const removeTodo = (room, sender, toRemoveTodo) => {
    if (isEmpty(toRemoveTodo)) {
        throw '투두삭제 실패😟\n삭제할 할일들을 띄어쓰기로 구분해 입력해주세요.\n ex) 투두삭제 잠자기 밥먹기\n or) 투두삭제 1 4 5';
    }
    let output = ''
    return findDB('sender', 'todo', room, sender)
        .then(res => {
            if (res == null) {
                throw '등록된 투두가 없습니다.😟'
            }
            toRemoveTodo = toRemoveTodo.split(' ').map(x => x.trim())
            let newTodo = []
            let removedTodo = []
            for (let i in res['todo']) {
                if (toRemoveTodo.includes(String(Number(i) + 1)) || toRemoveTodo.includes(res['todo'][i])) {
                    removedTodo.push(res['todo'][i])
                } else {
                    newTodo.push(res['todo'][i])
                }
            }

            if (removedTodo.length == 0) {
                throw '투두삭제 실패😟\n삭제할 투두가 목록에 하나도 없습니다.'
            }
            for (let t of removedTodo) {
                output += t + '\n'
            }
            res['todo'] = newTodo
            output += '\n투두삭제 완료🐣'
            return res
        })
        .then(res => {
            if (res['todo'].length == 0) {
                return deleteDB('sender', 'todo', room, sender)
            } else {
                output += ' ' + printArray(res['todo'], true, true)
                return updateDB('sender', 'todo', room, sender, res)
            }
        })
        .then(() => output)
}

const removeAllTodo = (room, sender) => {
    let output = sender + '님 투두완전삭제 성공🐣';
    return findDB('sender', 'todo', room, sender)
        .then(res => {
            if (res == null) {
                throw '등록된 투두가 없습니다.😟'
            }
        })
        .then(() => deleteDB('sender', 'todo', room, sender))
        .then(() => output)
}

// ==================파일 함수==================

const findDB = async (dbName, collectionName, room, sender) => {
    await client.connect()

    return client
        .db(dbName)
        .collection(collectionName)
        .findOne({'room': room, 'sender': sender})
        .finally(() => {
            client.close()
        })
}

const updateDB = async (dbName, collectionName, room, sender, updateValue) => {
    await client.connect()
    updateValue['room'] = room
    updateValue['sender'] = sender
    return client
        .db(dbName)
        .collection(collectionName)
        .updateOne({'room': room, 'sender': sender}, {'$set': updateValue}, {'upsert': true})
        .finally(() => {
            client.close()
        })
}

const deleteDB = async (dbName, collectionName, room, sender) => {
    await client.connect()

    return client
        .db(dbName)
        .collection(collectionName)
        .deleteOne({'room': room, 'sender': sender})
        .finally(() => {
            client.close()
        })
}

// ==================유틸 함수==================

const getTimes = (ms) => {
    let date = new Date()
    if (!isEmpty(ms)) {
        date.setTime(ms)
    }

    const y = date.getFullYear();
    const m = date.getMonth() + 1
    const d = date.getDate()
    const dateStr = String(y).slice(2) + String(m).padStart(2, '0') + String(d).padStart(2, '0')
    const h = date.getHours()
    const n = date.getMinutes()
    const s = date.getSeconds()
    const timeStr = String(h).padStart(2, '0') + String(n).padStart(2, '0') + String(s).padStart(2, '0')

    let output = {
        'ms': date.getTime(),
        'year': y,
        'month': m,
        'date': d,
        'hour': h,
        'minute': n,
        'second': s,
        'dateStr': dateStr,
        'timeStr': timeStr,
    }

    return output
}

const dateStrToMs = (sixStr) => {
    let date = new Date()
    const y = sixStr.slice(0, 2);
    const m = sixStr.slice(2, 4);
    const d = sixStr.slice(4, 6);

    date.setFullYear('20' + y);
    date.setMonth(m - 1)
    date.setDate(d)

    return date.getTime()
}

// ==================검사 함수==================

const isNature = (str) => {
    const regExp = /^[0-9]*$/;
    if (regExp.test(str)) {
        return true;
    } else {
        return false;
    }
}

const isNum = (str) => {
    const regExp = /^[0-9.-]*$/;
    if (regExp.test(str)) {
        return true;
    } else {
        return false;
    }
}

const isBad = (cmd) => {
    for (let s of words['badWords']) {
        if (cmd.includes(s)) {
            return true;
        }
    }
    return false
}

const isKorean = (str) => {
    const regExp = /^[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]*$/;
    if (regExp.test(str)) {
        return true;
    } else {
        return false;
    }
}

const isEmpty = (str) => {
    if (typeof str == 'undefined' || str == null || str == '') {
        return true;
    } else {
        return false;
    }
}

// ==================정제 함수==================

const printArray = (arr, keys, nStart) => {
    let output = ''
    if (keys){
        let i = 1
        for (let a of arr) {
            output += '\n[' + i + '] ' + a
            i += 1
        }
    }else{
        for (let a of arr) {
            output += '\n' + a
        }
    }
    if(!nStart){
        output = output.slice(1)
    }
    return output
}

const printObject = (obj, keys, nStart) => {
    let output = ''
    if (keys){
        for (let k in obj) {
            output += '\n' + k + ': ' + obj[k]
        }
    } else{
        for (let k in obj) {
            output += '\n' + obj[k]
        }
    }
    if(!nStart){
        output = output.slice(1)
    }
    return output
}

const numToKorUnit = (num) => {
    num = parseFloat(num);
    const unit = {0: '', 1: '만', 2: '억', 3: '조', 4: '경'};
    let index = 0;
    for (let i = 0; i < 4; i++) {
        if (num >= 10000) {
            num /= 10000;
        } else break;
        index += 1;
    }
    return num.toFixed(2) + unit[index];
}

const getDecPoint = (num, cur) => {
    // num:num, cur:(default:'kor','dol'), 반환:(0~4)
    if (isEmpty(cur)) {
        cur = 'kor';
    }
    num = Number(num);
    const n = Math.abs(num)
    if (cur == 'kor') {
        if (1000 <= n) {
            return 0;
        } else if (100 <= n) {
            return 1;
        } else if (10 <= n) {
            return 2;
        } else if (1 <= n) {
            return 3;
        } else {
            return 4;
        }
    } else if (cur == 'dol') {
        if (10 <= n) {
            return 2;
        } else {
            return 3 - Math.floor(Math.log10(n))
        }
    }
    return 0;
}

const refineNum = (num, decPoint) => {
    // '123,456.789'
    num = fixNum(num, 0, decPoint)
    num = addComma(num)

    return num
}

const fixNum = (num, decAdd, decPoint) => {
    // num:num, decPoint:(default:자동, int)
    if (isEmpty(decAdd)) {
        decAdd = 0
    }
    if (isEmpty(decPoint)) {
        decPoint = getDecPoint(num);
    }

    num = Number(num).toFixed(decPoint + decAdd);

    return num
}

const addComma = (num) => {
    num = String(num);
    if (num.includes('.')) {
        let price = num.split('.');
        return price[0].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '.' + price[1];
    } else {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
}

const removeComma = (str) => {
    return str.split(',').join('');
}