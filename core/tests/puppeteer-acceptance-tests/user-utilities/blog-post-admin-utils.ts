// Copyright 2023 The Oppia Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Blog Admin users utility file.
 */

import { baseUser } from '../puppeteer-testing-utilities/puppeteer-utils';
import { testConstants } from '../puppeteer-testing-utilities/test-constants';
import showMessage from '../puppeteer-testing-utilities/show-message-utils';

const blogTitleInput = 'input.e2e-test-blog-post-title-field';
const blogBodyInput = 'div.e2e-test-rte';
const thumbnailPhotoBox = 'div.e2e-test-photo-clickable';
const unauthErrorContainer = 'div.e2e-test-error-container';
const blogDashboardAuthorDetailsModal = 'div.modal-dialog';
const roleUpdateUsernameInput = 'input#label-target-update-form-name';
const blogEditorUsernameInput = 'input#label-target-form-reviewer-username';
const maximumTagLimitInput = 'input#mat-input-0';
const blogAuthorBioField = 'textarea.e2e-test-blog-author-bio-field';
const blogDashboardUrl = testConstants.URLs.BlogDashboard;
const blogAdminUrl = testConstants.URLs.BlogAdmin;
const publishBlogPostButton = 'button.e2e-test-publish-blog-post-button';
const addThumbnailImageButton = 'button.e2e-test-photo-upload-submit';
const blogPostThumbnailImage = testConstants.images.blogPostThumbnailImage;
const doneButton = 'button.oppia-save-state-item-button';
const confirmButton = 'button.e2e-test-confirm-button';

const LABEL_FOR_SAVE_BUTTON = 'Save';
const LABEL_FOR_ADD_ELEMENT_BUTTON = 'Add element';

export class e2eBlogPostAdmin extends baseUser {
  /**
   * Function for adding blog post author bio in blog dashboard.
   */
  async addUserBioInBlogDashboard(): Promise<void> {
    await this.type(blogAuthorBioField, 'Dummy-User-Bio');
    await this.page.waitForSelector(
      'button.e2e-test-save-author-details-button:not([disabled])');
    await this.clickOn('button.e2e-test-save-author-details-button');
  }

  /**
   * Function for navigating to the blog dashboard page.
   */
  async navigateToBlogDashboardPage(): Promise<void> {
    await this.goto(blogDashboardUrl);
  }

  /**
   * This function creates a blog post with given title.
   * @param {string} draftBlogPostTitle - The title of the draft blog post
   * to be created.
   */
  async createDraftBlogPostWithTitle(
      draftBlogPostTitle: string): Promise<void> {
    await this.addUserBioInBlogDashboard();
    /** Giving explicit timeout because we need to wait for small
     * transition to complete. We cannot wait for the next element to click
     * using its selector as it is instantly loaded in the DOM but cannot
     * be clicked until the transition is completed.
     */
    await this.page.waitForTimeout(500);
    await this.clickOn('button.create-new-blog-post-button');
    await this.type(blogTitleInput, draftBlogPostTitle);
    await this.page.keyboard.press('Tab');
    await this.type(blogBodyInput, 'test blog post body content');
    await this.clickOn(doneButton);
    await this.page.waitForTimeout(500);
    await this.clickOn('button.e2e-test-save-as-draft-button');

    showMessage('Successfully created a draft blog post!');
    await this.goto(blogDashboardUrl);
  }

  /**
   * This function deletes a draft blog post with given title.
   * @param {string} draftBlogPostTitle - The title of the draft blog post.
   */
  async deleteDraftBlogPostWithTitle(
      draftBlogPostTitle: string): Promise<void> {
    await this.page.exposeFunction('deleteDraftBlogPost', async() => {
    /** Giving explicit timeout because we need to wait for small
     * transition to complete. We cannot wait for the next element to click
     * using its selector as it is instantly loaded in the DOM but cannot
     * be clicked until the transition is completed.
     */
      await this.page.waitForTimeout(100);
      await this.clickOn('Delete');
      await this.page.waitForSelector(confirmButton); //TODO: here is one more flake - timeout
      await this.clickOn(confirmButton);
      showMessage('Draft blog post with given title deleted successfully!');
    });
    await this.page.evaluate(async({draftBlogPostTitle}) => {
      const allDraftBlogPosts = document.getElementsByClassName(
        'blog-dashboard-tile-content');
      for (let i = 0; i < allDraftBlogPosts.length; i++) {
        let checkDraftBlogPostTitle = (allDraftBlogPosts[i].
          getElementsByClassName(
            'e2e-test-blog-post-title')[0] as HTMLElement).innerText;
        if (draftBlogPostTitle === checkDraftBlogPostTitle) {
          (allDraftBlogPosts[i].getElementsByClassName(
            'e2e-test-blog-post-edit-box')[0] as HTMLButtonElement).click();
          // eslint-disable-next-line oppia/disallow-flags
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (window as any).deleteDraftBlogPost();  // TODO: is the use of any here ok?
          return;
        }
      }
    }, {draftBlogPostTitle});
  }

  /**
   * This function checks if the Publish button is disabled.
   */
  async expectPublishButtonToBeDisabled(): Promise<void> {
    await this.page.waitForSelector(publishBlogPostButton);
    await this.page.evaluate(() => {
      const publishedButtonIsDisabled = (document.getElementsByClassName(
        'e2e-test-publish-blog-post-button')[0] as HTMLButtonElement).disabled;
      if (!publishedButtonIsDisabled) {
        throw new Error(
          'Published button is not disabled when the blog post data is not' +
          ' completely filled');
      }
    });
    showMessage(
      'Published button is disabled when blog post data is not completely' +
      ' filled');
  }

  /**
   * This function publishes a blog post with given title.
   * @param {string} newBlogPostTitle - The title of the blog post
   * to be published.
   */
  async publishNewBlogPostWithTitle(newBlogPostTitle: string): Promise<void> {
    await this.addUserBioInBlogDashboard();
    /** Giving explicit timeout because we need to wait for small
     * transition to complete. We cannot wait for the next element to click
     * using its selector as it is instantly loaded in the DOM but cannot
     * be clicked until the transition is completed.
     */
    await this.page.waitForTimeout(500);
    await this.clickOn('button.create-new-blog-post-button');

    await this.expectPublishButtonToBeDisabled();
    await this.clickOn('button.mat-button-toggle-button');
    await this.expectPublishButtonToBeDisabled();
    await this.clickOn(thumbnailPhotoBox);
    await this.uploadFile(blogPostThumbnailImage);
    await this.page.waitForSelector(
      `${addThumbnailImageButton}:not([disabled])`);
    await this.clickOn(addThumbnailImageButton);
    await this.page.waitForTimeout(500);
    await this.expectPublishButtonToBeDisabled();

    await this.type(blogTitleInput, newBlogPostTitle);
    await this.page.keyboard.press('Tab');
    await this.type(blogBodyInput, 'test blog post body content');
    await this.clickOn(doneButton);

    await this.page.waitForSelector(
      `${publishBlogPostButton}:not([disabled])`);
    await this.clickOn(publishBlogPostButton);
    await this.page.waitForSelector('button.e2e-test-confirm-button');
    await this.clickOn(confirmButton);
    showMessage('Successfully published a blog post!');
  }

  /**
   * This function creates a new blog post with the given title.
   * @param {string} newBlogPostTitle - The title of the blog post.
   */
  async createNewBlogPostWithTitle(newBlogPostTitle: string): Promise<void> {
    await this.clickOn('NEW POST');
    await this.clickOn('button.mat-button-toggle-button');
    await this.clickOn(thumbnailPhotoBox);
    await this.uploadFile(blogPostThumbnailImage);
    await this.page.waitForSelector(
      `${addThumbnailImageButton}:not([disabled])`);
    await this.clickOn(addThumbnailImageButton);
    await this.page.waitForTimeout(500);

    await this.type(blogTitleInput, newBlogPostTitle);
    await this.page.keyboard.press('Tab');
    await this.type(blogBodyInput, 'test blog post body content - duplicate');
    await this.clickOn(doneButton);
  }

  /**
   * This function deletes a published blog post with the given title.
   * @param {string} blogPostTitle - The title of the published blog post
   * to be deleted.
   */
  async deletePublishedBlogPostWithTitle(blogPostTitle: string): Promise<void> {
    await this.clickOn('PUBLISHED');
    await this.page.exposeFunction('deletePublishedBlogPost', async() => {
      /** Giving explicit timeout because we need to wait for small
      * transition to complete. We cannot wait for the next element to click
      * using its selector as it is instantly loaded in the DOM but cannot
      * be clicked until the transition is completed. */
      await this.page.waitForTimeout(500);
      await this.clickOn('Delete');
      await this.page.waitForSelector(confirmButton);
      await this.clickOn(confirmButton);
      showMessage('Published blog post with given title deleted successfully!');
    });
    await this.page.evaluate(async(blogPostTitle) => {
      const allPublishedBlogPosts = document.getElementsByClassName(
        'blog-dashboard-tile-content');
      for (let i = 0; i < allPublishedBlogPosts.length; i++) {
        let publishedBlogPostTitle = (allPublishedBlogPosts[i].
          getElementsByClassName(
            'e2e-test-blog-post-title')[0] as HTMLElement).innerText;
        if (publishedBlogPostTitle === blogPostTitle) {
          (allPublishedBlogPosts[i].getElementsByClassName(
            'e2e-test-blog-post-edit-box')[0] as HTMLButtonElement).click();
          // eslint-disable-next-line oppia/disallow-flags
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (window as any).deletePublishedBlogPost();    // TODO: is the use of any here ok?
          return;
        }
      }
    }, blogPostTitle);
  }

  /**
   * This function checks that the user is unable to publish a blog post.
   */
  async expectUserUnableToPublishBlogPost(
      expectedWarningMessage: string): Promise<void> {
    const toastMessageBox = await this.page.$(
      'div.e2e-test-toast-warning-message');
    const toastMessageWarning = await this.page.evaluate(
      el => el.textContent, toastMessageBox);
    const isPublishButtonDisabled = await this.page.$eval(
      publishBlogPostButton, (button) => {
        return (button as HTMLButtonElement).disabled;
      });

    if (!isPublishButtonDisabled) {
      throw new Error('User is able to publish the blog post');
    }
    if (expectedWarningMessage !== toastMessageWarning) {
      throw new Error(
        'Expected warning message is not same as the actual warning message\n' +
        `Expected warning: ${expectedWarningMessage}\n` +
        `Displayed warning: ${toastMessageWarning}\n`);
    }

    showMessage(
      'User is unable to publish the blog post because ' + toastMessageWarning);
  }

  /**
   * This function checks the number of the blog posts in the blog dashboard.
   * @param {number} number - The number of the blog posts.
   */
  async expectNumberOfBlogPostsToBe(number: number): Promise<void> {
    await this.page.evaluate(async(number) => {
      const allBlogPosts = document.getElementsByClassName(
        'blog-dashboard-tile-content');
      if (allBlogPosts.length !== number) {
        throw new Error(
          `Number of blog posts is not equal to ${number}`);
      }
    }, number);

    showMessage(`Number of blog posts is equal to ${number}`);
  }

  /**
   * This function navigates to the Published tab in the blog-dashbaord.
   */
  async navigateToPublishTab(): Promise<void> {
    await this.goto(blogDashboardUrl);
    await this.clickOn('PUBLISHED');
    showMessage('Navigated to publish tab.');
  }

  /**
   * This function checks a draft blog post to be created with the given title.
   * @param {string} checkDraftBlogPostByTitle - The title of draft blog post.
   */
  async expectDraftBlogPostWithTitleToBePresent(
      checkDraftBlogPostByTitle: string): Promise<void> {
    await this.goto(blogDashboardUrl);
    await this.page.evaluate(async(checkDraftBlogPostByTitle) => {
      const allDraftBlogPosts = document.getElementsByClassName(
        'blog-dashboard-tile-content');
      let count = 0;
      for (let i = 0; i < allDraftBlogPosts.length; i++) {
        let draftBlogPostTitle = (allDraftBlogPosts[i].getElementsByClassName(
          'e2e-test-blog-post-title')[0] as HTMLElement).innerText;
        if (draftBlogPostTitle === checkDraftBlogPostByTitle) {
          count++;
        }
      }
      if (count === 0) {
        throw new Error(
          `Draft blog post with title ${checkDraftBlogPostByTitle} does not` +
          ' exist!');
      } else if (count > 1) {
        throw new Error(
          `Draft blog post with title ${checkDraftBlogPostByTitle} exists` +
          ' more than once!');
      }
    }, checkDraftBlogPostByTitle);
    showMessage(
      `Draft blog post with title ${checkDraftBlogPostByTitle} exists!`);
  }

  /**
   * This function checks if the blog post with given title is published.
   * @param {string} blogPostTitle - The title of the blog post.
   */
  async expectPublishedBlogPostWithTitleToBePresent(
      blogPostTitle: string): Promise<void> {
    await this.goto(blogDashboardUrl);
    await this.clickOn('PUBLISHED');
    await this.page.evaluate(async(blogPostTitle) => {
      const allPublishedBlogPosts = document.getElementsByClassName(
        'blog-dashboard-tile-content');
      let count = 0;
      for (let i = 0; i < allPublishedBlogPosts.length; i++) {
        let publishedBlogPostTitle = (
          allPublishedBlogPosts[i].getElementsByClassName(
            'e2e-test-blog-post-title')[0] as HTMLElement).innerText;
        if (publishedBlogPostTitle === blogPostTitle) {
          count++;
        }
      }
      if (count === 0) {
        throw new Error(
          `Blog post with title ${blogPostTitle} does not exist!`);
      } else if (count > 1) {
        throw new Error(
          `Blog post with title ${blogPostTitle} exists more than once!`);
      }
    }, blogPostTitle);
    showMessage(
      `Published blog post with title ${blogPostTitle} exists!`);
  }

  /**
   * This function checks if the blog dashboard is not accessible by the user.
   */
  async expectBlogDashboardAccessToBeUnauthorized(): Promise<void> {
    await this.goto(blogDashboardUrl);
    try {
      await this.page.waitForSelector(unauthErrorContainer);
      showMessage('User unauthorized to access blog dashboard!');
    } catch (err) {
      throw new Error(
        'No unauthorization error on accessing the blog dashboard page!');
    }
  }

  /**
   * This function checks if the blog dashboard is accessible by the user.
   */
  async expectBlogDashboardAccessToBeAuthorized(): Promise<void> {
    /** Here we are trying to check if the blog dashboard is accessible to the
     * guest user after giving the blog admin role to it. There is a
     * modal dialog box asking for the user name and bio for the users
     * given blog admin role as they first time opens the blog-dashboard. */
    await this.goto(blogDashboardUrl);
    try {
      await this.page.waitForSelector(blogDashboardAuthorDetailsModal);
      showMessage('User authorized to access blog dashboard!');
    } catch (err) {
      throw new Error('User unauthorized to access blog dashboard!');
    }
  }

  /**
   * This function assigns a user with a role from the blog admin page.
   * @param {string} username - The username of the user.
   * @param {string} role - The role of the user.
   */
  async assignUserToRoleFromBlogAdminPage(
      username: string, role: string): Promise<void> {
    await this.goto(blogAdminUrl);
    await this.page.select('select#label-target-update-form-role-select', role);
    await this.type(roleUpdateUsernameInput, username);
    await this.clickOn('button.oppia-blog-admin-update-role-button');
  }

  /**
   * This function removes blog editor role from the users.
   * @param {string} username - The username of the user.
   */
  async removeBlogEditorRoleFromUsername(username: string): Promise<void> {
    await this.goto(blogAdminUrl);
    await this.type(blogEditorUsernameInput, username);
    await this.clickOn('button.oppia-blog-admin-remove-blog-editor-button');
  }

  /**
   * This function checks if the tag name exists in the blog taglist.
   * @param {string} tagName - The name of the tag.
   */
  async expectTagToNotExistInBlogTags(tagName: string): Promise<void> {
    await this.page.evaluate(async(tagName) => {
      const tagList = document.getElementsByClassName('form-control');
      for (let i = 0; i < tagList.length; i++) {
        if ((tagList[i] as HTMLInputElement).value === tagName) {
          throw new Error(`Tag ${tagName} already exists in tag list!`);
        }
      }
    }, tagName);
    showMessage(`Tag with name ${tagName} does not exist in tag list!`);
  }

  /**
   * This function adds a new tag in the blog taglist.
   * @param {string} tagName - The name of the tag.
   */
  async addNewBlogTag(tagName: string): Promise<void> {
    await this.clickOn(LABEL_FOR_ADD_ELEMENT_BUTTON);
    await this.page.waitForTimeout(100);
    await this.page.evaluate((tagName) => {
      const tagList = document.getElementsByClassName('form-control');
      (tagList[tagList.length - 1] as HTMLInputElement).value = tagName;
    }, tagName);
    await this.clickOn(LABEL_FOR_SAVE_BUTTON);
    showMessage(`Tag ${tagName} added in tag list successfully!`);
  }

  /**
   * This function checks tag exists in the blog taglists.
   * @param {string} tagName - The name of the tag.
   */
  async expectTagToExistInBlogTags(tagName: string): Promise<void> {
    await this.page.evaluate(async(tagName) => {
      const tagList = document.getElementsByClassName('form-control');
      for (let i = 0; i < tagList.length; i++) {
        if ((tagList[i] as HTMLInputElement).value === tagName) {
          return;
        }
      }
      throw new Error(`Tag ${tagName} does not exist in tag list!`);
    }, tagName);
    showMessage(`Tag with name ${tagName} exists in tag list!`);
  }

  /**
   * This function changes the blog tags limit.
   * @param {string} limit - The limit of the blog tags.
   */
  async setMaximumTagLimitTo(limit: string): Promise<void> {
    // These steps are for deleting the existing value in the input field.
    const tagInputField = await this.page.$(maximumTagLimitInput);
    await tagInputField?.click({ clickCount: 3 });
    await this.page.keyboard.press('Backspace');

    await this.type(maximumTagLimitInput, limit);
    await this.clickOn(LABEL_FOR_SAVE_BUTTON);

    showMessage(`Successfully updated the tag limit to ${limit}!`);
  }

  /**
   * This function checks if the tag limit is not equal to.
   * @param {string} limit - The limit of the blog tags.
   */
  async expectMaximumTagLimitNotToBe(limit: string): Promise<void> {
    await this.page.evaluate(async(limit) => {
      const tagLimit = (document.getElementById(
        'mat-input-0') as HTMLInputElement)?.value;
      if (tagLimit === limit) {
        throw new Error(`Maximum tag limit is already ${limit}!`);
      }
    }, limit);
    showMessage(`Maximum tag limit is not ${limit}!`);
  }

  /**
   * This function checks if the tag limit is equal to.
   * @param {string} limit - The limit of the blog tags.
   */
  async expectMaximumTagLimitToBe(limit: string): Promise<void> {
    await this.page.evaluate(async(limit) => {
      const tagLimit = (document.getElementById(
        'mat-input-0') as HTMLInputElement).value;
      if (tagLimit !== limit) {
        throw new Error(`Maximum tag limit is not ${limit}!`);
      }
    });
    showMessage(`Maximum tag is currently ${limit}!`);
  }
}