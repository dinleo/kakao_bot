import {handler} from "./main.js";

const event = {
    'body' : JSON.stringify({
        'fun': 'gpt',
        'room': 'room02',
        'sender': 'Leo',
        'message': '넌 누구니'
    })
}

handler(event).then((value) => {
    console.log(value)
})

