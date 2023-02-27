import {handler} from "./main.js";

const event = {
    'body' : JSON.stringify({
        'fun': 'test',
        'room': 'room02',
        'sender': 'Leo',
        'message': 'ㅎㅇ'
    })
}

handler(event).then((value) => {
    console.log(value)
})

