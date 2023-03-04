import {config} from 'dotenv';
import {MongoClient, ServerApiVersion} from "mongodb";

config()
const mongoUri = process.env.MONGO_URI
const client = new MongoClient(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1
});

export default class utils {
    // 시간
    static getTimes = (ms) => {
        let date = new Date()
        if (!this.isEmpty(ms)) {
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

    static dateStrToMs = (sixStr) => {
        let date = new Date()
        const y = sixStr.slice(0, 2);
        const m = sixStr.slice(2, 4);
        const d = sixStr.slice(4, 6);

        date.setFullYear(Number('20' + y));
        date.setMonth(m - 1)
        date.setDate(d)

        return date.getTime()
    }

    // 체크
    static isNature = (str) => {
        const regExp = /^[0-9]*$/;
        if (regExp.test(str)) {
            return true;
        } else {
            return false;
        }
    }

    static isNum = (str) => {
        const regExp = /^[0-9.-]*$/;
        if (regExp.test(str)) {
            return true;
        } else {
            return false;
        }
    }

    static isBad = (cmd) => {
        for (let s of words['badWords']) {
            if (cmd.includes(s)) {
                return true;
            }
        }
        return false
    }

    static isKorean = (str) => {
        const regExp = /^[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]*$/;
        if (regExp.test(str)) {
            return true;
        } else {
            return false;
        }
    }

    static isEmpty = (str) => {
        if (typeof str == 'undefined' || str == null || str == '') {
            return true;
        } else {
            return false;
        }
    }

    // 검사
    static isNature = (str) => {
        const regExp = /^[0-9]*$/;
        if (regExp.test(str)) {
            return true;
        } else {
            return false;
        }
    }

    static isNum = (str) => {
        const regExp = /^[0-9.-]*$/;
        if (regExp.test(str)) {
            return true;
        } else {
            return false;
        }
    }

    static isBad = (cmd) => {
        for (let s of words['badWords']) {
            if (cmd.includes(s)) {
                return true;
            }
        }
        return false
    }

    static isKorean = (str) => {
        const regExp = /^[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]*$/;
        if (regExp.test(str)) {
            return true;
        } else {
            return false;
        }
    }

    static isEmpty = (str) => {
        if (typeof str == 'undefined' || str == null || str == '') {
            return true;
        } else {
            return false;
        }
    }

    // 정제
    static printArray = (arr, keys, nStart) => {
        let output = ''
        if (keys) {
            let i = 1
            for (let a of arr) {
                output += '\n[' + i + '] ' + a
                i += 1
            }
        } else {
            for (let a of arr) {
                output += '\n' + a
            }
        }
        if (!nStart) {
            output = output.slice(1)
        }
        return output
    }

    static printObject = (obj, keys, nStart) => {
        let output = ''
        if (keys) {
            for (let k in obj) {
                output += '\n' + k + ': ' + obj[k]
            }
        } else {
            for (let k in obj) {
                output += '\n' + obj[k]
            }
        }
        if (!nStart) {
            output = output.slice(1)
        }
        return output
    }

    static numToKorUnit = (num) => {
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

    static getDecPoint = (num, cur) => {
        // num:num, cur:(default:'kor','dol'), 반환:(0~4)
        if (this.isEmpty(cur)) {
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

    static refineNum = (num, decPoint) => {
        // '123,456.789'
        num = this.fixNum(num, 0, decPoint)
        num = this.addComma(num)

        return num
    }

    static fixNum = (num, decAdd, decPoint) => {
        // num:num, decPoint:(default:자동, int)
        if (this.isEmpty(decAdd)) {
            decAdd = 0
        }
        if (this.isEmpty(decPoint)) {
            decPoint = this.getDecPoint(num);
        }

        num = Number(num).toFixed(decPoint + decAdd);

        return num
    }

    static addComma = (num) => {
        num = String(num);
        if (num.includes('.')) {
            let price = num.split('.');
            return price[0].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '.' + price[1];
        } else {
            return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        }
    }

    static removeComma = (str) => {
        return str.split(',').join('');
    }

    // 파일
    static findDB = async (dbName, collectionName, room, sender) => {
        await client.connect()

        return client
            .db(dbName)
            .collection(collectionName)
            .findOne({'room': room, 'sender': sender})
            .finally(() => {
                client.close()
            })
    }

    static updateDB = async (dbName, collectionName, room, sender, updateValue) => {
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

    static deleteDB = async (dbName, collectionName, room, sender) => {
        await client.connect()

        return client
            .db(dbName)
            .collection(collectionName)
            .deleteOne({'room': room, 'sender': sender})
            .finally(() => {
                client.close()
            })
    }
}
