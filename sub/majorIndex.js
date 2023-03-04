import axios from "axios";
import {load} from "cheerio";
import utl from "../utils/utils.js";

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

export default class majorIndex {
    static naverStock = (message) => {
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
}
