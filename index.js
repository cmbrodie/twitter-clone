
`
Set a key-value pair in localStorage:
localStorage.setItem('key', 'value');

Get the value associated with a key from localStorage:
const value = localStorage.getItem('key');

Remove a key-value pair from localStorage:
localStorage.removeItem('key');

Clear all data stored in localStorage:
localStorage.clear();
`
let USERNAME = '@Mogwai';
let imageUrl = 'images/mogwai.jpg';
let isReplying = false;
const changeUser = document.querySelector('#change-user')
changeUser.addEventListener('submit', (event) => {
    event.preventDefault()
    const changeUserFormData = new FormData(changeUser)
    USERNAME = changeUserFormData.get('handle')
    try {
        imageUrl = changeUserFormData.get('image-url')
        document.querySelector('.profile-pic').src = imageUrl
    } catch (error) {
        console.log(error)
    }
    saveToLocalStorage()
    document.querySelector('.modal').style.display = 'none'
})


document.querySelector('.clear-data').addEventListener('click', () => {
    localStorage.clear()
    location.reload()
})
document.querySelector('.change-btn').addEventListener('click', () => {
    document.querySelector('.modal').style.display = 'inline'
})
document.querySelector('.modal-close').addEventListener('click', () => {
    document.querySelector('.modal').style.display = 'none'
})

import { td } from './data.js'
import { v4 as uuidv4 } from 'https://jspm.dev/uuid';
let tweetsData = td
if (!localStorage.length) {
    saveToLocalStorage()

}


function saveToLocalStorage() {
    localStorage.setItem('tweetsData', JSON.stringify(tweetsData))
    localStorage.setItem('imageUrl', imageUrl)
    localStorage.setItem('USERNAME', USERNAME)
}
function readFromLocalStorage() {
    const savedData = localStorage.getItem('tweetsData')
    if (savedData) {
        tweetsData = JSON.parse(savedData)
        imageUrl = localStorage.getItem('imageUrl')
        USERNAME = localStorage.getItem('USERNAME')
    }
}
readFromLocalStorage();
document.querySelector('.profile-pic').src = imageUrl
render()

console.log('tweetsData = ', tweetsData)


document.addEventListener('click', function (e) {
    if (e.target.dataset.like) {
        handleLikeClick(e.target.dataset.like)
    }
    else if (e.target.dataset.retweet) {
        handleRetweetClick(e.target.dataset.retweet)
    }
    else if (e.target.dataset.reply) {
        showReplies(e.target.dataset.reply)
    }
    else if (e.target.dataset.makeReply) {
        console.log('trying to reply..')
        console.log(isReplying)
        console.log(e.target.dataset.makeReply)
        if (!isReplying) {
            makeReplyTo(e.target.dataset.makeReply)
            isReplying = !isReplying
        }
    }
    else if (e.target.dataset.delete) {
        deleteTweet(e.target.dataset.delete)
    }
    else if (e.target.id === 'tweet-btn') {
        handleTweetBtnClick()
    }
    else if (e.target.id === 'reply-btn') {
        handleReplyBtnClick(e.target.dataset.replyBtn)
        isReplying = false

    }
})
function deleteTweet(tweetId) {
    let tweetIndex = tweetsData.map(tweet => tweet.uuid).indexOf(tweetId)
    tweetsData.splice(tweetIndex, 1)
    render()
    saveToLocalStorage()
    console.log(tweetId)
    console.log(tweetsData)

}
function handleLikeClick(tweetId) {
    const targetTweetObj = tweetsData.filter(function (tweet) {
        return tweet.uuid === tweetId
    })[0]

    if (targetTweetObj.isLiked) {
        targetTweetObj.likes--
    }
    else {
        targetTweetObj.likes++
    }
    targetTweetObj.isLiked = !targetTweetObj.isLiked
    render()
    saveToLocalStorage()
}

function handleRetweetClick(tweetId) {
    const targetTweetObj = tweetsData.filter(function (tweet) {
        return tweet.uuid === tweetId
    })[0]

    if (targetTweetObj.isRetweeted) {
        targetTweetObj.retweets--
    }
    else {
        targetTweetObj.retweets++
    }
    targetTweetObj.isRetweeted = !targetTweetObj.isRetweeted
    render()
    saveToLocalStorage()
}

function showReplies(replyId) {
    console.log(document.getElementById(`replies-${replyId}`))
    document.getElementById(`replies-${replyId}`).classList.toggle('hidden')
}
function makeReplyTo(tweetId) {
    document.getElementById(`replies-${tweetId}`).innerHTML += `
    <div class="tweet-input-area">
    <img src=${imageUrl} class="profile-pic">
    <textarea placeholder="Type your reply..." id="reply-input"></textarea>
    </div>
    <button id="reply-btn" data-reply-btn=${tweetId}>Reply</button>
    `
    showReplies(tweetId)
}

function handleTweetBtnClick() {
    const tweetInput = document.getElementById('tweet-input')

    if (tweetInput.value) {
        tweetsData.unshift({
            handle: USERNAME,
            profilePic: imageUrl,
            likes: 0,
            retweets: 0,
            tweetText: tweetInput.value,
            replies: [],
            isLiked: false,
            isRetweeted: false,
            uuid: uuidv4()
        })
        render()
        saveToLocalStorage()
        tweetInput.value = ''
    }

}

function handleReplyBtnClick(tweetId) {
    const replyInput = document.getElementById('reply-input')
    const targetTweet = tweetsData.filter((tweet) => {
        return tweet.uuid === tweetId
    })[0]
    if (replyInput.value) {
        console.log(replyInput.value)
        console.log(tweetId)
        let newReply = {
            handle: USERNAME,
            profilePic: imageUrl,
            tweetText: replyInput.value,
        }
        targetTweet.replies.push(newReply)
        render()
        saveToLocalStorage()
        replyInput.value = ''
    }
}

function getFeedHtml() {
    let feedHtml = ``

    tweetsData.forEach(function (tweet) {
        let deleteable = ''
        if (tweet.handle === USERNAME) {
            deleteable = `<span class="tweet-detail">
            <i class="fa-solid fa-trash"
            data-delete="${tweet.uuid}"
            ></i>
        </span>`
        }
        let likeIconClass = ''

        if (tweet.isLiked) {
            likeIconClass = 'liked'
        }

        let retweetIconClass = ''

        if (tweet.isRetweeted) {
            retweetIconClass = 'retweeted'
        }

        let repliesHtml = ''

        if (tweet.replies.length > 0) {
            tweet.replies.forEach(function (reply) {
                repliesHtml += `
<div class="tweet-reply">
    <div class="tweet-inner">
        <img src="${reply.profilePic}" class="profile-pic">
            <div>
                <p class="handle">${reply.handle}</p>
                <p class="tweet-text">${reply.tweetText}</p>
            </div>
        </div>
</div>
`
            })
        }


        feedHtml += `
<div class="tweet">
    <div class="tweet-inner">
        <img src="${tweet.profilePic}" class="profile-pic">
        <div>
            <p class="handle">${tweet.handle}</p>
            <p class="tweet-text">${tweet.tweetText}</p>
            <div class="tweet-details">
                <span class="tweet-detail">
                    <i class="fa-regular fa-comment-dots"
                    data-reply="${tweet.uuid}"
                    ></i>
                    ${tweet.replies.length}
                </span>
                <span class="tweet-detail">
                    <i class="fa-solid fa-heart ${likeIconClass}"
                    data-like="${tweet.uuid}"
                    ></i>
                    ${tweet.likes}
                </span>
                <span class="tweet-detail">
                    <i class="fa-solid fa-retweet ${retweetIconClass}"
                    data-retweet="${tweet.uuid}"
                    ></i>
                    ${tweet.retweets}
                </span>
                <span class="tweet-detail">
                    <i class="fa-solid fa-reply"
                    data-make-reply="${tweet.uuid}"
                    ></i>
                </span>
                ${deleteable}
            </div>   
        </div>            
    </div>
    <div class="hidden" id="replies-${tweet.uuid}">
        ${repliesHtml}
    </div>   
</div>
`
    })
    return feedHtml
}

function render() {
    document.getElementById('feed').innerHTML = getFeedHtml()
    isReplying = false
}



