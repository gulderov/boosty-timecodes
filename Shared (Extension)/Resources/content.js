const process = debounce(() => {
  const posts = document.querySelectorAll('[class^="Post_root_"]');
  for (const post of posts) {
    if (isShading(post)) {
      continue;
    }

    attachOnClick(post);
    replaceTimecodes(post);
  }
}, 100);

const observer = new MutationObserver(() => {
  process();
});

const root = document.querySelector("#root");
observer.observe(root, {childList: true, subtree: true});


function replaceTimecodes(post) {
  const timePattern = /(\d+):(\d+)(?::(\d+))?/g;

  const blocks = post.querySelectorAll('[class^="BlockRenderer_markup_"]');
  for (const block of blocks) {
    if (block.dataset.boostyTimecodesProcessed) {
      continue;
    }

    const blockText = block.innerHTML;
    const modifiedText = blockText.replace(timePattern, (match) => {
      const anchor = document.createElement('a');
      anchor.href = 'javascript:void(0)';
      anchor.dataset.timecode = match;
      anchor.classList.add('boosty-timecode');
      anchor.textContent = match;

      return anchor.outerHTML;
    });

    block.dataset.boostyTimecodesProcessed = 'true';
    block.innerHTML = modifiedText;
  }
}

function attachOnClick(post) {
  if (!post.dataset.boostyTimecodesListenerAttached) {
    post.dataset.boostyTimecodesListenerAttached = 'true';
    post.addEventListener('click', (event) => {
      let target = event.target;
      while (target !== event.currentTarget && !target.classList.contains('boosty-timecode')) {
        target = target.parentNode;
      }

      if (target.classList.contains('boosty-timecode')) {
        const seconds = getSeconds(target.dataset.timecode);

        event.preventDefault();
        onClick(post, seconds).catch((error) => console.error('Boosty Timecodes error:', error));
      }
    });
  }
}

async function onClick(post, seconds) {
  const container = post.querySelector("[class^=VideoPlayerContainer_root_]");
  container.scrollIntoView({block: "center"});

  try {
    const player = await getPlayer(container, 'vk-video-player');
    await seek(player, seconds);
  } catch (error) {
    console.error('Boosty Timecodes error:', error);
  }
}

async function getPlayer(container, selector) {
  let attempts = 0;
  return new Promise((resolve, reject) => {
    let intervalId = setInterval(() => {
      attempts++;
      const player = container.querySelector(selector);
      if (player) {
        clearInterval(intervalId);
        resolve(player);
      } else if (attempts > 100) {
        clearInterval(intervalId);
        reject();
      }
    }, 250);
  });
}

async function seek(player, seconds) {
  try {
    const shadowRoot = player.shadowRoot;
    const playerWrapper = shadowRoot.querySelector(".player-wrapper");
    const videoWrapper = playerWrapper.querySelector(".video-wrapper");
    const previewContainer = playerWrapper.querySelector(".container");
    let video = playerWrapper.querySelector("video");

    await isVideoReady(video);

    videoWrapper.classList.remove("hidden");
    if (!previewContainer.classList.contains("hidden")) {
      previewContainer.classList.add("hidden");
    }

    video.currentTime = seconds;
    await video.play();
  } catch (error) {
    console.error('Boosty Timecodes error:', error);
  }
}

function isVideoReady(video) {
  return new Promise((resolve, reject) => {
    if (video?.readyState > 0) {
      resolve();
    } else {
      function onCanPlay() {
        video?.removeEventListener('canplay', onCanPlay);
        resolve();
      }

      video?.addEventListener('canplay', onCanPlay);
      setTimeout(() => {
        video?.removeEventListener('canplay', onCanPlay);
        reject();
      }, 5000);
    }
  });
}

function isShading(post) {
  const shading = post.querySelector("[class^=Post_shading_]");

  if (shading) {
    return true;
  }

  return false;
}

function getSeconds(timecode) {
  const parts = timecode.split(":").map(Number);

  if (parts.length == 3) {
    const [hours, minutes, seconds] = parts;

    return hours * 3600 + minutes * 60 + seconds;
  }

  if (parts.length == 2) {
    const [minutes, seconds] = parts;

    return minutes * 60 + seconds;
  }

  return 0;
}

function debounce(fn, ms) {
  let timeout;

  return function (...args) {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      return fn.apply(this, args);
    }, ms);
  };
}
