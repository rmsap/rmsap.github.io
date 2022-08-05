const footerTemplate = document.createElement('template');

footerTemplate.innerHTML = `
  <style>
    footer {
      height: 60px;
      padding: 0 10px;
      list-style: none;
      display: flex;
      flex-shrink: 0;
      justify-content: space-between;
      align-items: center;
      background-color: #4c6e70;
    }

    ul {
      padding: 0;
    }
    
    ul li {
      list-style: none;
      display: inline;
    }
    
    a {
      margin: 0 15px;
      color: inherit;
      text-decoration: none;
    }
    
    a:hover {
      padding-bottom: 5px;
      box-shadow: inset 0 -2px 0 0 #333;
    }
    
    .social-row {
      font-size: 20px;
    }
    
    .social-row li a {
      margin: 0 15px;
    }
  </style>
  <footer>
    <ul>
      <li><a href="index.html">Home</a></li>
      <li><a href="projects.html">Projects</a></li>
      <li><a href="about.html">About</a></li>
    </ul>
    <ul class="social-row">
      <li><a href="https://github.com/rmsap" target="_blank"><i class="fab fa-github"></i></a></li>
      <li><a href="https://www.linkedin.com/in/my-linkedin-profile" target="_blank"><i class="fab fa-linkedin"></i></a></li>
    </ul>
  </footer>
`;

class Footer extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    // Query the main DOM for FA
    const fontAwesome = document.querySelector('link[href*="font-awesome"]');
    const shadowRoot = this.attachShadow({ mode: 'closed' });

    // Conditionally load FA to the component
    if (fontAwesome) {
        shadowRoot.appendChild(fontAwesome.cloneNode());
    }

    shadowRoot.appendChild(footerTemplate.content);
  }
}

customElements.define('footer-component', Footer);