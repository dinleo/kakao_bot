import {config} from 'dotenv';
import {MongoClient, ServerApiVersion} from 'mongodb';

config()

const mongoUri = process.env.MONGO_URI
const client = new MongoClient(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1
});


export const handler = async (event) => {
    let req = JSON.parse(event['body'])
    let res = main(req['fun'], req['room'], req['sender'], req['message'])

    return res
        .then(v => {
            return {statusCode: 200, body: v}
        })
        .catch(e => {
            return {statusCode: 0, body: e}
        })
};

const main = async (fun, room, sender, message) => {
    let res

    switch (fun) {
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
            output += printArray(res['todo'])
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
            output += printArray(res['todo'])
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
                if (toRemoveTodo.includes(String(Number(i)+1)) || toRemoveTodo.includes(res['todo'][i])) {
                    removedTodo.push(res['todo'][i])
                } else {
                    newTodo.push(res['todo'][i])
                }
            }

            res['todo'] = newTodo
            if (removedTodo.length == 0){
                throw '투두삭제 실패😟\n삭제할 투두가 목록에 하나도 없습니다.'
            }
            for (let t of removedTodo) {
                output += t + '\n'
            }
            output += '\n투두삭제 완료🐣\n'
            output += printArray(newTodo)
            return res
        })
        .then(res => updateDB('sender', 'todo', room, sender, res))
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

const findDB = async (db, collection, room, sender) => {
    await client.connect()

    return client
        .db(db)
        .collection(collection)
        .findOne({'room': room, 'sender': sender})
        .finally(() => {
            client.close()
        })
}

const updateDB = async (db, collection, room, sender, updateValue) => {
    await client.connect()
    updateValue['room'] = room
    updateValue['sender'] = sender
    return client
        .db(db)
        .collection(collection)
        .updateOne({'room': room, 'sender': sender}, {'$set': updateValue}, {'upsert': true})
        .finally(() => {
            client.close()
        })
}

const deleteDB = async (db, collection, room, sender) => {
    await client.connect()

    return client
        .db(db)
        .collection(collection)
        .deleteOne({'room': room, 'sender': sender})
        .finally(() => {
            client.close()
        })
}

// ==================유틸 함수==================

const isEmpty = (str) => {
    if (typeof str == 'undefined' || str == null || str == '') {
        return true;
    } else {
        return false;
    }
}

const printArray = (arr) => {
    let output = ''
    let i = 1
    for (let a of arr) {
        output += '\\n[' + i + '] ' + a
        i += 1
    }
    return output
}

const printObject = (obj) => {
    let output = ''
    for (let k in obj) {
        output += '\n' + k + ': ' + obj[k]
    }
    return output
}