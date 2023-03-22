import { initialData } from './data.js'
import { v4 as uuidv4 } from 'https://jspm.dev/uuid';
//Global Variables
let tweetsData = initialData
let USERNAME = '@Mogwai';
let imageUrl = 'images/mogwai.jpg';
let isReplying = false;



//Local Storage Functionality

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

//Functions

function deleteTweet(tweetId) {
    let tweetIndex = tweetsData.map(tweet => tweet.uuid).indexOf(tweetId)
    tweetsData.splice(tweetIndex, 1)
    render()
    saveToLocalStorage()

}
function getTargetTweet(tweetId) {
    return tweetsData.filter((tweet) => {
        return tweet.uuid === tweetId
    })[0]
}

function updateEngagement(count, flag, tweetId) {
    const targetTweet = getTargetTweet(tweetId)
    if (targetTweet[flag]) {
        targetTweet[count]--
    }
    else {
        targetTweet[count]++
    }
    targetTweet[flag] = !targetTweet[flag]
    render()
    saveToLocalStorage()
}

function handleLikeClick(tweetId) {
    updateEngagement('likes', 'isLiked', tweetId)
}

function handleRetweetClick(tweetId) {
    updateEngagement('retweets', 'isRetweeted', tweetId)
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
    const targetTweet = getTargetTweet(tweetId)

    if (replyInput.value) {
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

function canDelete(tweet) {
    if (tweet.handle === USERNAME) {
        return `<span class="tweet-detail">
        <i class="fa-solid fa-trash"
        data-delete="${tweet.uuid}"
        ></i>
    </span>`
    }
    else {
        return ''
    }
}

function replyHtml(reply) {
    return `
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
}

function tweetHtml(tweet, deleteable, repliesHtml) {
    return `
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
                        <i class="fa-solid fa-heart ${(tweet.isLiked ? 'liked' : '')}"
                        data-like="${tweet.uuid}"
                        ></i>
                        ${tweet.likes}
                    </span>
                    <span class="tweet-detail">
                        <i class="fa-solid fa-retweet ${(tweet.isRetweeted ? 'retweeted' : '')}"
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
}



function getFeedHtml() {
    let feedHtml = ``

    tweetsData.forEach(function (tweet) {
        let deleteable = canDelete(tweet)

        let repliesHtml = ''
        if (tweet.replies.length > 0) {
            tweet.replies.forEach((reply) => {
                repliesHtml += replyHtml(reply)
            })
        }

        feedHtml += tweetHtml(tweet, deleteable, repliesHtml)
    })
    return feedHtml
}

function render() {
    document.getElementById('feed').innerHTML = getFeedHtml()
    isReplying = false
}



function init() {


    //If nothing in localStorage, put initial data in
    if (!localStorage.length) {
        saveToLocalStorage()
    }
    //readcontents of localStorage regardless
    readFromLocalStorage();

    //update imageUrl if necessary
    document.querySelector('.profile-pic').src = imageUrl
    render()



    // Click Event Listener handler, pull in other listeners 
    //and extract logic into functions
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


    //change user functionality

    //change user button brings up modal
    document.querySelector('.change-btn').addEventListener('click', () => {
        document.querySelector('.modal').style.display = 'inline'
    })

    //change user submit form and logic
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

    //close out change user modal
    document.querySelector('.modal-close').addEventListener('click', () => {
        document.querySelector('.modal').style.display = 'none'
    })

    //clear data
    document.querySelector('.clear-data').addEventListener('click', () => {
        localStorage.clear()
        location.reload()
    })

}
init();