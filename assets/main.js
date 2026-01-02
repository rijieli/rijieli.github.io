// 设置无匹配时返回数据
// 按分类展示关键字

(function () {
  "use strict";

  /* ============================================================================ */
  // MARK: Search Methods
  let siteMapData = { post: [] };
  let searchInputField = document.querySelector("#search-input-field");
  let searchIcon = document.querySelector("#search-icon");
  let searchResultDomNode = document.querySelector("#search-result");

  let globalSearchInputField = document.querySelector(
    "#global-search-input-field"
  );
  let globalSearchClearButton = document.querySelector("#global-search-clear");
  let globalSearchResultDomNode = document.querySelector(
    "#global-search-result"
  );

  let categoryMap = {
    post: "Blog",
    work: "Archive",
    code: "Project",
    category: "Tag",
  };

  if (searchIcon) {
    searchIcon.addEventListener("click", toggleSearchInput);
  }

  function toggleSearchInput() {
    searchInputField.classList.toggle("hidden");
    searchInputField.focus();
  }

  function debounce(func, wait) {
    let timeout;

    return function () {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(function () {
        func.apply(this, arguments);
      }, wait);
    };
  }

  function parseQueryParameter() {
    let queryString = window.location.search;
    if (queryString == undefined || queryString == "") {
      return {};
    }

    if (queryString.startsWith("?")) queryString = queryString.slice(1);
    let result = {};
    queryString.split("&").forEach((elm) => {
      let element = elm.split("=");
      let queryValue = element[1].replaceAll("+", " ");
      queryValue = decodeURIComponent(queryValue).trim();
      result[decodeURIComponent(element[0])] = queryValue;
    });
    return result;
  }

  // 获取初始文档
  function fetchSitemap() {
    if (this.status != 200) {
      return;
    }

    // Parse XML sitemap
    let parser = new DOMParser();
    let xmlDoc = parser.parseFromString(this.responseText, "text/xml");
    
    // Check for parsing errors
    let parseError = xmlDoc.querySelector("parsererror");
    if (parseError) {
      console.error("Error parsing XML:", parseError.textContent);
      return;
    }

    // Initialize data structure
    siteMapData = {
      Post: [],
      Work: [],
      Code: [],
      Category: []
    };

    // Extract all URL entries
    let urls = xmlDoc.querySelectorAll("url");
    urls.forEach((urlNode) => {
      let loc = urlNode.querySelector("loc");
      if (!loc) return;
      
      // Find search:title and search:type elements
      // Check all child elements for namespace-aware matching
      let title = null;
      let type = null;
      
      for (let child of urlNode.children) {
        // Check if it's a title element (namespace-aware)
        if (child.localName === "title" || child.nodeName.includes("title")) {
          title = child;
        }
        // Check if it's a type element (namespace-aware)
        if (child.localName === "type" || child.nodeName.includes("type")) {
          type = child;
        }
      }
      
      if (!title) return; // Skip if no title found
      
      let url = loc.textContent;
      let titleText = title.textContent;
      let typeText = type ? type.textContent : "Page";
      
      // Remove base URL if present
      if (url.startsWith("https://roger.zone")) {
        url = url.replace("https://roger.zone", "");
      }
      
      // Map type to category
      let category = typeText;
      if (category === "Post") {
        siteMapData.Post.push({ title: titleText, url: url });
      } else if (category === "Work") {
        siteMapData.Work.push({ title: titleText, url: url });
      } else if (category === "Code") {
        siteMapData.Code.push({ title: titleText, url: url });
      } else if (category === "Category") {
        siteMapData.Category.push({ title: titleText, url: url });
      }
    });
  }

  function matchPattern(keyword, item) {
    let result = false;
    // Not Safe
    // if(item.search(new RegExp(keyword, "i")) != -1) result = true;
    if (item.toLowerCase().indexOf(keyword.toLowerCase()) != -1) result = true;

    return result;
  }

  function processData(keyword, resultNode, resultLimit) {
    let result = {};
    let resultCount = 0;

    keyword = keyword.trim();

    for (let category in siteMapData) {
      result[category] = [];
      if (siteMapData[category].length > 0) {
        siteMapData[category].forEach((item) => {
          if (matchPattern(keyword, item["title"])) {
            result[category].push(item);
            resultCount++;
          }
        });
      }
    }

    let searchResult = [];

    for (let category in result) {
      if (result[category].length > 0) {
        searchResult.push(
          assembleResult(keyword, category, result[category], resultLimit)
        );
      }
    }

    if (searchResult.length > 0) {
      searchResult.forEach((domNode) => {
        resultNode.appendChild(domNode);
      });
    } else {
      let noResultNode = document.createElement("p");
      noResultNode.innerText = "No matching result";
      noResultNode.classList.add("search-result-empty");
      resultNode.appendChild(noResultNode);
    }
  }

  /** Assemble result group HTML fragement */
  function assembleResult(keyword, category, matchedItems, resultLimit) {
    let resultGroupDivNode = document.createElement("div");
    resultGroupDivNode.classList.add("result-group");
    let titleNode = document.createElement("div");
    titleNode.classList.add("search-result-title");
    let titleTextNode = document.createElement("h3");
    titleTextNode.innerText = categoryMap[category.toLowerCase()];

    titleNode.appendChild(titleTextNode);
    resultGroupDivNode.appendChild(titleNode);
    let ulNode = document.createElement("ul");

    if (resultLimit != -1 && matchedItems.length > resultLimit) {
      matchedItems = matchedItems.slice(0, resultLimit);
      let moreResultANode = document.createElement("a");
      moreResultANode.href = "/search?q=" + escape(keyword);
      moreResultANode.innerText = "···";
      titleNode.appendChild(moreResultANode);
    }

    matchedItems.forEach((item) => {
      ulNode.appendChild(generateDom(item["title"], item["url"]));
    });

    resultGroupDivNode.appendChild(ulNode);

    return resultGroupDivNode;
  }

  function generateDom(title, url) {
    let liDomNode = document.createElement("li");
    liDomNode.classList.add("search-list-item");
    let domNode = document.createElement("a");
    domNode.href = url;
    domNode.appendChild(document.createTextNode(title));
    liDomNode.appendChild(domNode);
    return liDomNode;
  }

  function searchInput() {
    if (searchResultDomNode === null) {
      return;
    }
    searchResultDomNode.innerHTML = "";
    let KEYWORD = searchInputField.value.trim();
    if (KEYWORD.length > 0) {
      searchResultDomNode.classList.remove("hidden");
      processData(KEYWORD, searchResultDomNode, 3);
    } else {
      searchResultDomNode.classList.add("hidden");
    }
  }

  function globalSearchInput() {
    globalSearchResultDomNode.innerHTML = "";
    let KEYWORD = globalSearchInputField.value.trim();
    if (KEYWORD.length > 0) processData(KEYWORD, globalSearchResultDomNode, -1);
  }

  function initSearchComponent() {
    let searchInputHander = debounce(searchInput, 300);
    let globalSearchInputHander = debounce(globalSearchInput, 300);

    if (searchInputField) {
      searchInputField.addEventListener("input", searchInputHander);
    }

    if (globalSearchInputField)
      globalSearchInputField.addEventListener("input", globalSearchInputHander);
    if (globalSearchClearButton)
      globalSearchClearButton.addEventListener("click", (e) => {
        globalSearchInputField.value = "";
      });

    document.body.addEventListener("click", () => {
      searchResultDomNode?.classList.add("hidden");
    });

    if (globalSearchInputField) {
      let queryString = parseQueryParameter();
      if (queryString["q"]) {
        globalSearchInputField.value = queryString["q"];
        processData(queryString["q"], globalSearchResultDomNode, -1);
      }
    }
  }

  /* ============================================================================ */
  // MARK: Handle Scroll
  let lastKnownScrollPosition = 0;
  let ticking = false;

  function changeScrollToTopButton(scrollPos) {
    let scrollToTopButton = document.getElementById("scroll-to-top-button");
    if (scrollPos > 100) {
      scrollToTopButton.style.visibility = "visible";
    } else {
      scrollToTopButton.style.visibility = "hidden";
    }
  }

  document.addEventListener("scroll", function (e) {
    lastKnownScrollPosition = window.scrollY;

    if (!ticking) {
      window.requestAnimationFrame(function () {
        changeScrollToTopButton(lastKnownScrollPosition);
        ticking = false;
      });

      ticking = true;
    }
  });

  /* ============================================================================ */
  // MARK: get search document
  var oReq = new XMLHttpRequest();
  oReq.addEventListener("load", fetchSitemap);
  oReq.addEventListener("loadend", initSearchComponent);
  oReq.open("GET", "/sitemap.xml");
  oReq.send();

  /* ============================================================================ */
  // MARK: get search document
  let foldButton = document.querySelector(".projects-section-button");
  let foldChevron = document.getElementById("projects-fold");
  let projectsListContainer = document.querySelector(
    ".projects-list-container"
  );
  let projectsList = document.querySelector(".projects-list");
  foldButton?.addEventListener("click", function () {
    if (projectsListContainer.clientHeight) {
      projectsListContainer.style.height = 0;
      foldChevron.classList.remove("rotate");
    } else {
      projectsListContainer.style.height =
        projectsList.clientHeight + 56 + "px";
      foldChevron.classList.add("rotate");
    }
  });
  
  let codeItems = document.querySelectorAll("div.post-content > div > div > .highlight");
  codeItems.forEach((item) => {
    let copyButton = document.createElement("button");
    copyButton.classList.add("copy-button");
    copyButton.innerText = "Copy";
    copyButton.addEventListener("click", () => {
      let code = item.querySelector("code");
      navigator.clipboard.writeText(code.innerText);
      copyButton.innerText = "Copied";
      copyButton.classList.add("copied")
      setTimeout(() => {
        copyButton.innerText = "Copy";
        copyButton.classList.remove("copied")
      }, 1500)
    });
    item.parentElement.appendChild(copyButton);
  })
})();
