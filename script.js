const results = {
  priority: '',
  hints: '',
}

function lazyText(loadingAttr,ele) {
  if ( loadingAttr === "lazy") {
    return "<li>🔴 You are lazy loading your LCP element.</li>"
  } else if (/lazyload|data-src|swiper-lazy|data-rimg|data-lazy/.test(ele)) {
    return "<li>🔴 You may be lazy loading your LCP element using a JavaScript library.</li>"
  } else {
    return "<li>🟢 No lazy loading of the LCP element detected.</li>"
  }
}

function priorityText(ele) {
  if (ele.includes('fetchpriority="low"')) {
    return "<li>🔴 Your LCP element has a low priority set. Try high instead.</li>"
  } else if (ele.includes('fetchpriority="high"')) {
    return "<li>🟢 Fetchpriority of the LCP is high.</li>"
  } else {
    return "<li>🟠 Test whether adding a high priority to your LCP will make it faster.</li>"
  } 
}

results.lcp = await new Promise((resolve) => {
  new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1];
    const ele = lastEntry.element.outerHTML
    let lis = `<li>The LCP timing is ${Math.round(lastEntry.startTime)}ms.</li>`
  
    if (lastEntry.element.nodeName === "IMG") {
        lis = lis.concat(
          lazyText(lastEntry.element.getAttribute("loading"), ele),
          priorityText(ele))
    }
    
    lis = lis.concat(`<li>LCP HTML:</li><pre style="">${ele.replaceAll("<","&lt;")}</pre>`)
    resolve(lis)
  }).observe({ type: "largest-contentful-paint", buffered: true });
})

const FETCHPRIORITY_CHECKS = [
  {
    selector: '[fetchpriority="high"]',
    headingText: "Elements with fetchpriority set to high:",
    limits: {
      warn: 3,
      error: 5,
    }
  },
  {
    selector: '[fetchpriority="low"]',
    headingText: "Elements with fetchpriority set to low:"
  },
]

function warningMsg(length, limits) {
  let warning = ''
  if (length >= limits.error) {
    warning = `<p>🔴 You have more than ${limits.error - 1} which may hinder loading speed.</p>`
  } else if (length >= limits.warn) {
    warning = `<p>🟠 You have more than ${limits.warn - 1} which may hinder loading speed.</p>`
  }
  return warning
}

FETCHPRIORITY_CHECKS.forEach(check => {
  const nodelist = document.querySelectorAll(check.selector)
  const warning = check.limits ? warningMsg(nodelist.length, check.limits) : ''

  let flis = []
  nodelist.forEach(e => {
    const value = e.href ? `with href="${e.href}"` : `with src="${e.src}"`
    flis.push(`<li>${e.nodeName} ${value}</li>`)
  })

  results.priority = results.priority.concat(`<h2>${check.headingText} ${nodelist.length}</h2>${warning}<ol>${flis.join('')}</ol>`)
})

const CHECKS = [
  {
    selector: 'link[rel="preload"]',
    headingText: "Preloaded assets:",
    limits: {
      warn: 3,
      error: 5,
    }
  },
  {
    selector: 'link[rel="prefetch"]',
    headingText: "Prefetched assets:"
  },
  {
    selector: 'link[rel="preconnect"]',
    headingText: "Preconnected domains:"
  },
  {
    selector: 'link[rel="dns-prefetch"]',
    headingText: "DNS-prefetched domains:"
  }
]

CHECKS.forEach(check => {
  const nodelist = document.querySelectorAll(check.selector)
  const warning = check.limits ? warningMsg(nodelist.length, check.limits) : ''

  let flis = []
  nodelist.forEach(e => {
    const value = e.href ? `with href="${e.href}"` : `with src="${e.src}"`
    flis.push(`<li>${e.href}</li>`)
  })

  results.hints = results.hints.concat(`<h2>${check.headingText} ${nodelist.length}</h2>${warning}<ol>${flis.join('')}</ol>`)
})

class Modal extends HTMLElement {
  static get observedAttributes() {
    return ["open"];
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.close = this.close.bind(this);
  }

  attributeChangedCallback(attrName, oldValue, newValue) {
    if (oldValue !== newValue) {
      this[attrName] = this.hasAttribute(attrName);
    }
  }

  connectedCallback() {
    const { shadowRoot } = this;
    shadowRoot.innerHTML = `<style>
      h1, h2, p, ol, ul {margin-bottom:0}
      .close {
        position: absolute;
        top: 0;
        right: 0;
      }
      .wrapper {
        font-size: 16px;
        font-family: Arial, Helvetica, sans-serif;
        opacity: 0;
        transition: visibility 0s, opacity 0.25s ease-in;
        z-index: 9999999;
      }
      .wrapper:not(.open) {
        visibility: hidden;
      }
      .wrapper.open {
        align-items: center;
        display: flex;
        justify-content: center;
        height: 100vh;
        position: fixed;
        inset: 0;
        opacity: 1;
        visibility: visible;
      }
      .overlay {
        background: rgba(0, 0, 0, 0.8);
        height: 100%;
        position: fixed;
        inset: 0;
        width: 100%;
      }
      .dialog {
        background: #fff;
        color: #333;
        padding: 2rem;
        position: fixed;
        inset: 32px;
        box-shadow: 0 12px 15px 0 rgb(0 0 0 / 25%);
        overflow-y:scroll;
      }
      button {
        margin: 1.2rem;
        padding: 0.25rem;
      }
      pre {
        overflow:auto;width:100%;direction:ltr;padding:0.5rem;text-align:left;white-space:pre-wrap;tab-size:2;hyphens:none;background:#222;color:#FFF;font-size:0.8rem;
      }
    </style>
    <div class="wrapper">
      <div class="overlay"></div>
      <div class="dialog" role="dialog" aria-labelledby="title" aria-describedby="content">
        <button class="close">Close</button>
        <h1 id="title">Priorities Scanner Results</h1>
        <div id="content" class="content">
          <p>Refresh this page to clear all the code from this bookmarklet. <a href="https://projects.sia.codes/priorities-bookmarklet/">Share</a> this bookmarklet.</p>
          <h2>LCP Analysis</h2>
          <ul>${results.lcp}</ul>
          ${results.priority}
          ${results.hints}
        </div>
      </div>
    </div>`;

    shadowRoot.querySelector("button").addEventListener("click", this.close);
    shadowRoot.querySelector(".overlay").addEventListener("click", this.close);
    this.open = this.open;
  }

  disconnectedCallback() {
    this.shadowRoot
      .querySelector("button")
      .removeEventListener("click", this.close);
    this.shadowRoot
      .querySelector(".overlay")
      .removeEventListener("click", this.close);
  }

  get open() {
    return this.hasAttribute("open");
  }

  set open(isOpen) {
    const { shadowRoot } = this;
    shadowRoot.querySelector(".wrapper").classList.toggle("open", isOpen);
    shadowRoot.querySelector(".wrapper").setAttribute("aria-hidden", !isOpen);
    if (isOpen) {
      this._wasFocused = document.activeElement;
      this.setAttribute("open", "");
      document.addEventListener("keydown", this._watchEscape);
      this.focus();
      shadowRoot.querySelector("button").focus();
    } else {
      this._wasFocused && this._wasFocused.focus && this._wasFocused.focus();
      this.removeAttribute("open");
      document.removeEventListener("keydown", this._watchEscape);
      this.close();
    }
  }

  close() {
    if (this.open !== false) {
      this.open = false;
    }
    const closeEvent = new CustomEvent("dialog-closed");
    this.dispatchEvent(closeEvent);
  }

  _watchEscape(event) {
    if (event.key === "Escape") {
      this.close();
    }
  }
}
  
customElements.define("priorities-modal", Modal);
const ele = document.createElement("priorities-modal")
document.querySelector("body").prepend(ele)
ele.open = true
