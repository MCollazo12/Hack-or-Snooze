'use strict';

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */
function navAllStories() {
  console.debug('navAllStories');
  hidePageComponents();
  putStoriesOnPage();
  initFavorites();
}

/** Show login/signup on click of "login" */
function navLoginClick() {
  console.debug('navLoginClick');
  hidePageComponents();
  $loginForm.show();
  $signupForm.show();
}

/** When a user first logins in, update the navbar to reflect that. */
function updateNavOnLogin() {
  console.debug('updateNavOnLogin');
  $('.main-nav-links').show();
  $navLogin.hide();
  $navLogOut.show();
  $navUserProfile.text(`${currentUser.username}`).show();
}

/*Show new story form on click of "submit" */
function navSubmitClick() {
  console.debug('navSubmitClick');
  hidePageComponents();
  $submitForm.show();
  $allStoriesList.show();
}

/** Show user's favorited stories on click of 'favorites' */
function navFavoritesClick() {
  console.debug('navFavoritesClick');
  hidePageComponents();
  showFavorites();
  initFavorites();
}



$body.on('click', '#nav-all', navAllStories);
$navLogin.on('click', navLoginClick);
$navSubmitStory.on('click', navSubmitClick);
$navFavorites.on('click', navFavoritesClick);
