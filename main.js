import todo from './sub/todo.js'
import mIdx from './sub/majorIndex.js'
import gpt from './sub/gpt.js'

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
        case 'gpt':
            res = gpt.chat(room, sender, message)
            break
        case 'naverStock':
            res = mIdx.naverStock(message.slice(2))
            break
        case 'addTodo':
            res = todo.addTodo(room, sender, message.slice(5));
            break
        case 'allTodo':
            res = todo.allTodo(room, sender);
            break
        case 'removeTodo':
            res = todo.removeTodo(room, sender, message.slice(5));
            break
        case 'removeAllTodo':
            res = todo.removeAllTodo(room, sender);
            break
        default:
            res = Promise.reject('no Function')
    }

    return res
}

const test = (room, sender, message) => {

}
