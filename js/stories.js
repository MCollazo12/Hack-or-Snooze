'use strict';

// This is the global list of the stories, an instance of StoryList
let storyList;

/* Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/*
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story, delBtn = false) {
  const hostName = story.getHostName();

  // Check if user is logged in
  const userState = Boolean(currentUser);

  return $(`
      <li id="${story.storyId}">
        ${delBtn ? generateDelBtn() : ''}
        ${userState ? generateStarIcon(story, currentUser) : ''}
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

//If user is logged in, append stars to the stories on page
function generateStarIcon(story, user) {
  const isFavorite = user.checkFavorite(story);
  const starClass = isFavorite ? 'fa fa-star checked' : 'fa fa-star unchecked';
  return `<i class='${starClass}' id="starBtn"></i>`;
}

//Append a delete button to user's own stories
function generateDelBtn() {
  return "<i class='fa fa-trash' id='trash-btn'></i>";
}

/* Gets list of stories from server, generates their HTML, and puts on page. */
function putStoriesOnPage() {
  console.debug('putStoriesOnPage');

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

/** Append list of user's favorited stories */
function showFavorites() {
  console.debug('showFavorites');

  $favoriteStoriesList.empty();

  if (currentUser.favorites.length === 0) {
    $favoriteStoriesList.append(
      "<i>You haven't favorited any stories yet! Add some by clicking the star next to a story.</i>"
    );
  } else {
    currentUser.favorites.forEach((story) => {
      const $story = generateStoryMarkup(story);
      $favoriteStoriesList.append($story);
    });
  }
  $favoriteStoriesList.show();
}

/** Adds functionality to the favorite star buttons */
async function handleStarClick(evt) {
  const $starBtn = $(evt.target);
  const storyId = $starBtn.closest('li').attr('id');
  const story = storyList.stories.find((s) => s.storyId === storyId);

  if ($starBtn.hasClass('checked')) {
    $starBtn.toggleClass('checked', false).toggleClass('unchecked', true);
    await currentUser.removeFavoriteStory(story);
  } else if ($starBtn.hasClass('unchecked')) {
    $starBtn.toggleClass('unchecked', false).toggleClass('checked', true);
    await currentUser.addFavoriteStory(story);
  }
}

$body.on('click', '#starBtn', handleStarClick);

/*********************************************************************************** */

/** Append's list of user's own stories */
function showMyStories() {
  console.debug('showMyStories');

  const usrStories = currentUser.ownStories;

  $userStoriesList.empty();

  if (usrStories.length === 0) {
    $userStoriesList.append("<i>You haven't submitted any stories</i>");
  } else {
    usrStories.forEach((s) => {
      $userStoriesList.append(generateStoryMarkup(s, true));
    });
  }

  $userStoriesList.show();
}

/* Handles submission from new story form */
async function submitNewStory(evt) {
  console.debug('submitNewStory');
  evt.preventDefault();

  //Retrieve new story form input values
  const author = $('#author').val();
  const title = $('#title').val();
  const url = $('#url').val();
  const username = currentUser.username;

  //Create a storyData object containing those inputs &
  //pass them to the StoryList.addStory method along w/ currentUser for login token
  const storyData = { title, author, url, username };
  const newStory = await storyList.addStory(currentUser, storyData);

  //Generate returned HTML by passing to generateStoryMarkup &
  //prepend the new story to $allStorieslist
  const $newStory = generateStoryMarkup(newStory);
  $allStoriesList.prepend($newStory);

  $submitForm.slideUp('fast');
  $submitForm.trigger('reset');
}
$submitForm.on('submit', submitNewStory);

/** Allows user to delete their own submitted story */
async function deleteStory(evt) {
  const $storyLi = $(evt.target).closest('li');
  const storyId = $storyLi.attr('id');

  await storyList.removeStory(currentUser, storyId);

  showMyStories();
}

$userStoriesList.on('click', '#trash-btn', deleteStory);

/*
 * TODO:
 * 1) add 'my stories' section in HTML'
 * 2) add navigation and event listener
 * 3) make sure currentUser stories show up in 'my stories' link
 * 4) add the ability to delete a story
 */
