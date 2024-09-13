import React, { useState } from "react";
import Navbar from "../components/Common/Navbar.tsx";
import "../styles/Home.css";
import { useDataContext } from "../contexts/CharacterDataContext.tsx";
import Footer from "../components/Common/Footer.tsx";
import FeaturesModal from "../components/Modals/FeaturesModal.tsx";

const Home: React.FC = () => {
  const { characters } = useDataContext();
  const [open, setOpen] = useState(false);
  const [link, setLink] = useState<string>("");

  const chara = Object.values(characters).find((i) => i.charaId === 1104);

  const openFeatureModal1 = () => {
    setOpen(true);
    setLink("/damage-calculator/");
  };

  const closeFeatureModal = () => {
    setOpen(false);
  };

  return (
    <>
      <div className="home-background"></div>
      <div className="container">
        <header>
          <Navbar />
          {open && (
            <FeaturesModal onClose={closeFeatureModal} pageLink={link} />
          )}
        </header>
        <main>
          <section className="section">
            <div className="header">
              <h1 className="heading">~ Welcome To Waves ~</h1>
              <p className="paragraph">
                Wuthering Waves Damage Calculator and Echo Scorer
              </p>
            </div>
            <div className="sub-header">
              <h2 className="heading-2">What's new?</h2>
              <article className="card-guide">
                <img
                  className="card-guide-image"
                  src={chara?.images.portrait}
                  alt={`${chara?.name} image`}
                />
                <h2 className={`heading-2 ${chara?.element}`}>
                  <a className="chara-name">{chara?.name}</a>
                </h2>
                <p className="paragraph">{chara?.bio}</p>
                <div className="flexbox-card-guide">
                  <p className="paragraph">Element: </p>
                  <p className={`paragraph ${chara?.element}`}>
                    {" "}
                    {chara?.element}
                  </p>
                </div>
                <div className="flexbox-card-guide">
                  <p className="paragraph">Weapon:</p>
                  <p className={`paragraph ${chara?.element}`}>
                    {chara?.weapon}
                  </p>
                </div>
                <p className={`paragraph ${chara?.element}`}>
                  {chara?.rarity.alt} Resonator
                </p>
                <div className="guide-link">
                  <a href={`/characters/${chara?.name}`}>
                    Click here to see the guide
                  </a>
                </div>
              </article>
            </div>
          </section>
          <section className="section">
            <div className="updates-data">
              <div>
                <h2 className="heading-2">Updates :</h2>
                <ul className="update-list">
                  <li className="update-list-item">Added Resonator Zhezhi</li>
                  <li className="update-list-item">
                    Added Rectifier Rime-Draped Sprouts
                  </li>
                  <li className="update-list-item">
                    Added Echo Save/Delete Function
                  </li>
                </ul>
              </div>
              <div>
                <h2 className="heading-2">Upcoming Updates :</h2>
                <ul className="update-list">
                  <li className="update-list-item">Echo Scorer</li>
                  <li className="update-list-item">
                    1.2 Resonator and Weapons
                  </li>
                  <li className="update-list-item">Minor QoL Changes</li>
                </ul>
              </div>
            </div>
          </section>
          <section className="section">
            <div className="home-features">
              <h2 className="heading-2">Check Out :</h2>
              <div className="damage-calc-home">
                <div className="home-feature-grid">
                  <div
                    className="home-feature-grid-item-1"
                    onClick={openFeatureModal1}
                  >
                    <div className="home-feature-grid-item-1-bg"></div>
                    <div className="home-feature-grid-item-overlay"></div>
                    <h2 className="header-2">Damage Calculator</h2>
                  </div>
                  <div
                    className="home-feature-grid-item-2"
                    aria-disabled={true}
                  >
                    <div className="home-feature-grid-item-2-bg"></div>
                    <div className="home-feature-grid-item-overlay"></div>
                    <h2 className="header-2">Echo Scorer</h2>
                    <p>(Coming Soon)</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
        <footer>
          <Footer />
        </footer>
      </div>
    </>
  );
};

export default Home;
