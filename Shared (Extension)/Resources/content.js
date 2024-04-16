const processDebounced = debounce(process, 50);
processDebounced();

const root = document.querySelector("#root");
const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    if (mutation.type === "childList") {
      processDebounced();
    }
  }
});
observer.observe(root, {
  childList: true,
  subtree: true,
});

function process() {
  const posts = root.querySelectorAll('[class^="Post_content_"]');

  for (const post of posts) {
    if (isShading(post)) {
      continue;
    }

    replaceTimecodes(post);
    addOnClickHandlers(post);
  }
}

function replaceTimecodes(post) {
  const timePattern = /(\d+):(\d+)(?::(\d+))?/g;
  const blocks = post.querySelectorAll('[class^="BlockRenderer_markup_"]');

  for (const block of blocks) {
    if (block.getAttribute("data-processed")) {
      continue;
    }

    const blockText = block.innerHTML;
    const hasTimePattern = timePattern.test(blockText);

    if (!hasTimePattern) {
      continue;
    }

    const modifiedText = blockText.replace(timePattern, (match) => {
      return `<a href="javascript:void(0)" data-timecode="${match}">${match}</a>`;
    });

    block.setAttribute("data-processed", true);
    block.innerHTML = modifiedText;
  }
}

function addOnClickHandlers(post) {
  const links = post.querySelectorAll("[data-timecode]");

  for (const link of links) {
    const timecode = link.getAttribute("data-timecode");
    const seconds = getSeconds(timecode);

    link.onclick = function (event) {
      event.preventDefault();
      onClick(post, seconds);
    };
  }
}

function onClick(post, seconds) {
  const container = post.querySelector("[class^=VideoPlayerContainer_root_]");
  container.scrollIntoView({ block: "center" });

  let videoPlayer = null;
  let count = 1;

  let intervalId = setInterval(() => {
    console.log({ count });
    count++;
    videoPlayer = container.querySelector("vk-video-player");

    if (count > 100) {
      clearInterval(intervalId);
    }

    if (videoPlayer) {
      const shadowRoot = videoPlayer.shadowRoot;
      const playerWrapper = shadowRoot.querySelector(".player-wrapper");
      const videoWrapper = playerWrapper.querySelector(".video-wrapper");
      const previewContainer = playerWrapper.querySelector(".container");
      let video = playerWrapper.querySelector("video");

      if (video?.readyState < 4) {
        return;
      }

      clearInterval(intervalId);

      videoWrapper.classList.remove("hidden");
      if (!previewContainer.classList.contains("hidden")) {
        previewContainer.classList.add("hidden");
      }

      video.pause();
      video.play();
      video.currentTime = seconds;
    }
  }, 50);
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
