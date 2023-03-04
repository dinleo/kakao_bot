import axios from 'axios'
import {load} from 'cheerio'
import utl from './utils/utils.js'

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
            if (utl.isEmpty(stockPrice)) {
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
            if (utl.isEmpty(decPoint)) {
                decPoint = 0
            } else {
                decPoint = decPoint.length
            }

            // price
            const oPrice = utl.removeComma(json['전일종가']);
            let hPrice = utl.removeComma(json['고가']);
            let lPrice = utl.removeComma(json['저가']);
            let cPrice = utl.removeComma(stockNow);
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
                '📈최고가: (' + hPct + '%) ' + utl.refineNum(hPrice, decPoint) + moneyExp,
                '📉최저가: (' + lPct + '%) ' + utl.refineNum(lPrice, decPoint) + moneyExp,
                '📊거래량: ' + volume,
                updw + '등락: (' + cPct + '%) ' + utl.refineNum(change, decPoint) + moneyExp + '\n',
                '💰현재가: ' + utl.refineNum(cPrice, decPoint) + moneyExp,
            ]

            return utl.printArray(tmp, false,false)
        })
}

// ==================투두 함수==================

const addTodo = (room, sender, newTodo) => {
    if (utl.isEmpty(newTodo)) {
        throw '투두추가 실패😟\n추가할 할일들을 띄어쓰기로 구분해 입력해주세요.\n ex) 투두추가 잠자기 밥먹기';
    }
    newTodo = newTodo.trim()
    let output = ''
    return utl.findDB('sender', 'todo', room, sender)
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
            output += utl.printArray(res['todo'], true, true)
            return res
        })
        .then(res => utl.updateDB('sender', 'todo', room, sender, res))
        .then(() => output)
}

const allTodo = (room, sender) => {
    let output = '🗓️' + sender + '님의 ToDo 목록🗓️\n';
    return utl.findDB('sender', 'todo', room, sender)
        .then(res => {
            if (res == null) {
                throw '등록된 투두가 없습니다.😟'
            }
            output += utl.printArray(res['todo'], true, true)
            return output
        })
}

const removeTodo = (room, sender, toRemoveTodo) => {
    if (utl.isEmpty(toRemoveTodo)) {
        throw '투두삭제 실패😟\n삭제할 할일들을 띄어쓰기로 구분해 입력해주세요.\n ex) 투두삭제 잠자기 밥먹기\n or) 투두삭제 1 4 5';
    }
    let output = ''
    return utl.findDB('sender', 'todo', room, sender)
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
                return utl.deleteDB('sender', 'todo', room, sender)
            } else {
                output += ' ' + utl.printArray(res['todo'], true, true)
                return utl.updateDB('sender', 'todo', room, sender, res)
            }
        })
        .then(() => output)
}

const removeAllTodo = (room, sender) => {
    let output = sender + '님 투두완전삭제 성공🐣';
    return utl.findDB('sender', 'todo', room, sender)
        .then(res => {
            if (res == null) {
                throw '등록된 투두가 없습니다.😟'
            }
        })
        .then(() => utl.deleteDB('sender', 'todo', room, sender))
        .then(() => output)
}