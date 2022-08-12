const headerTemplate = document.createElement('template');

headerTemplate.innerHTML = `
    <style>
        nav {
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            background-color:  #3B6566;
        }

        ul {
            padding: 0;
          }
          
          ul li {
            list-style: none;
            display: inline;
          }

        header {
            display: inline;
        }

        a {
            font-weight: 700;
            margin: 0 25px;
            color: #fff;
            text-decoration: none;
        }

        a:hover {
            padding-bottom: 5px;
            box-shadow: inset 0 -2px 0 0 #fff;
        }

        .dropdown {
            float: left;
            overflow: hidden;
        }

        .dropdown-content {
            display: none;
            position: absolute;
            background-color: #f9f9f9;
            min-width: 160px;
            box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
            z-index: 1;
        }

        .dropdown-content a {
            float: none;
            color: black;
            padding: 12px 16px;
            text-decoration: none;
            display: block;
            text-align: left;
        }

        .dropdown-content a:hover {
            background-color: #ddd;
        }

        .dropdown:hover .dropdown-content {
            display: block;
        }

        .social-row {
            font-size: 20px;
          }
          
          .social-row li a {
            margin: 0 15px;
          }

    </style>
    <header>
        <nav>
            <div>
                <a href="index.html">Home</a>
                <div class="dropdown">
                    <a href="projects.html">Projects</a>
                    <div class="dropdown-content">
                        <a href="siglo.html">SigLo</a>
                        <a href="image_processor.html">Image Processor</a>
                        <a href="apps.html">HELP/RecoverWE Apps</a>
                    </div>
                </div>
            </div>
            <ul class="social-row">
                <li><a href="https://github.com/rmsap" target="_blank"><i class="fab fa-github"></i></a></li>
                <li><a href="#" target="_blank"><i class="fab fa-linkedin"></i></a></li>
            </ul>
        </nav>
    </header>
`;

class Header extends HTMLElement {
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

        shadowRoot.appendChild(headerTemplate.content);
    }
}

customElements.define('header-component', Header);