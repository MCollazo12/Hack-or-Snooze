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

function generateStoryMarkup(story) {
  console.debug('generateStoryMarkup');
  const hostName = story.getHostName() || null;

  // Check if user is logged in
  const userState = Boolean(currentUser);


  return $(`
      <li id="${story.storyId}">
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
  const isFavorite = user.checkFavorite(story)
  const starClass = isFavorite ? 'fa fa-star checked' : 'fa fa-star unchecked';
  return `<i class='${starClass}' id="starBtn"></i>`;
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

/* Handles submission from new story form */
async function submitNewStory(evt) {
  console.debug('submitNewStory');
  evt.preventDefault();

  //Retrieve new story form input values
  const author = $('#author').val();
  const title = $('#title').val();
  const url = $('#url').val();

  //Create a storyData object containing those inputs &
  //pass them to the StoryList.addStory method along w/ currentUser for login token
  const storyData = { title, author, url };
  const newStory = await storyList.addStory(currentUser, storyData);

  //Generate returned HTML by passing to generateStoryMarkup &
  //prepend the new story to $allStorieslist
  const $newStory = generateStoryMarkup(newStory);
  $allStoriesList.prepend($newStory);

  $newStory.show();

  $submitForm.slideUp('fast');
  $submitForm.trigger('reset');
}

$submitForm.on('submit', submitNewStory);

/** Allows logged in users to see a separate list of favorited stories */
async function showFavorites() {
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


//Adds functionality to the favorite star buttons
async function handleStarClick(evt) {
  const $starBtn = $(evt.target);
  const storyId = $starBtn.closest('li').attr('id');
  const story = storyList.stories.find(s => s.storyId === storyId)

  if ($starBtn.hasClass('checked')) {
    $starBtn.toggleClass('checked', false).toggleClass('unchecked', true);
    await currentUser.removeFavoriteStory(story);
  } else if ($starBtn.hasClass('unchecked')) {
    $starBtn.toggleClass('unchecked', false).toggleClass('checked', true);
    await currentUser.addFavoriteStory(story);
  } 
  
}

$body.on('click', '#starBtn', handleStarClick);
