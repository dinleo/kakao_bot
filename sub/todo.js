import utl from "../utils/test.js";

export default class todo {
    static addTodo = (room, sender, newTodo) => {
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

    static allTodo = (room, sender) => {
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

    static removeTodo = (room, sender, toRemoveTodo) => {
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

    static removeAllTodo = (room, sender) => {
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
}