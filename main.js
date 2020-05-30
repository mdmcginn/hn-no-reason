const state = {}
const hnBaseUrl = 'http://127.0.0.1:8886'
function fetchTopStories() {
   const topStoriesUrl = `${hnBaseUrl}/news/1.json`
  return fetch(topStoriesUrl).then(response => response.json())
//    .then((data) => fetchStories(data))
	  .then((data) => renderStories(data))
}

function renderStories(data) {
   const stories = data.map((story) => {
//    return stories.map((story) => {
    const userUrl = `https://news.ycombinator.com/user?id=${story.user}`
    const storyItemUrl = `https://news.ycombinator.com/item?id=${story.id}`
    const html = `
      <div class='story' id='${story.id}'>
        <h3 class='title'>
          ${story.url ? `<a href='${story.url}' target='_blank'>${story.title}</a>`
            : `<a href='javascript:void(0)' onclick="toggleStoryText('${story.id}')" >${story.title}</a>`}
        </h3>

<span class='score'> ${story.points} </span> points by
        <a href='${userUrl}' target='_blank' class='story-by'> ${story.user}</a>
        <div class='toggle-view'>
          ${story.kids ? `
            <span
              onclick="fetchOrToggleComments('${story.kids}','${story.id}')"
              class='comments'
            > [toggle ${story.descendants} comments] </span>`
          : '' }
          <a href='${storyItemUrl}' target='_blank' class='hnLink'>[view on HN]</a>
        </div>

        ${story.text ?
          `<div class='storyText' id='storyText-${story.id}' style='display:none;'>
            ${story.text} </div>` : '' }
        <div id='comments-${story.id}' style='display: block;'></div>
      </div> `
    document.getElementById('hn').insertAdjacentHTML('beforeend', html)
  })
}
function toggleStoryText(storyId) {
  const storyText = document.getElementById(`storyText-${story.id}`)
  storyText.style.display = (storyText.style.display === 'block') ? 'none' : 'block'
}
function fetchComments(kids, storyId) {
  const commentIds = kids.split(',')
  const allComments = commentIds.map((commentId) => {
    const commentUrl = `${hnBaseUrl}/item/${commentId}.json`
    return fetch(commentUrl).then((response) => response.json()).then((comment) => comment)
  })
  return Promise.all(allComments).then((comments) => {
    state[storyId] = comments
    renderComments(comments, storyId)
  })
}
function fetchOrToggleComments(kids, storyId) {
  function toggleAllComments(storyId) {
    const allComments = document.getElementById(`comments-${storyId}`)
    allComments.style.display = (allComments.style.display === 'block') ? 'none' : 'block'
  }
  state[storyId] ? toggleAllComments(storyId) : fetchComments(kids, storyId)
}
function toggleComment(commentId) {
  const comment = document.getElementById(commentId)
  const toggle = document.getElementById(`toggle-${commentId}`)
  comment.style.display = (comment.style.display === 'block') ? 'none' : 'block'
  toggle.innerHTML = (toggle.innerHTML === '[ - ]') ? '[ + ]' : '[ - ]'
}
function renderComments(comments, storyId) {
  return comments.map((comment) => {
    const userUrl = `https://news.ycombinator.com/user?id=${comment.by}`
    const html = comment.deleted || comment.dead ? '' : `
      <div class='comment'>
        <span
          onclick='toggleComment("${comment.id}")'
          href='javascript:void(0)'
          id='toggle-${comment.id}'
          class='toggle-comment'
        >[ - ]</span>
        <a href='${userUrl}' class='comment-by'> ${comment.by}</a>
        <div id=${comment.id} class='comment-text' style='display:block;'>
          ${comment.text}
        </div>
      </div> `
    comment.parent == storyId ?
      document.getElementById(`comments-${storyId}`).insertAdjacentHTML('beforeend', html)
      : document.getElementById(comment.parent).insertAdjacentHTML('beforeend', html)
    if (comment.kids) return fetchComments(comment.kids.toString(), storyId)
  })
}
fetchTopStories()
