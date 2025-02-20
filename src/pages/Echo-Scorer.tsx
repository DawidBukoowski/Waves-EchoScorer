import "../styles/EchoScorer.css";
import { useEffect, useRef, useState } from "react";
import { useDataContext } from "../contexts/CharacterDataContext";
import { useParams } from "react-router-dom";
import CalcStats from "../components/CalculatorComponents/CalcStats";
import ScorerEchoCard from "../components/Cards/Scorer-EchoCard";
import ScorerWeaponCard from "../components/Cards/Scorer-WeaponCard";
import ScorerBar from "../components/SearchBars/ScorerBar";
import { useEchoContext } from "../contexts/EchoDataContext";
import { useEchoes } from "../contexts/CalcEchoContext";
import { useWeapons } from "../contexts/CalcWeaponContext";
import { useWeaponContext } from "../contexts/WeaponDataContext";
import html2canvas from "html2canvas";
import Footer from "../components/Common/Footer";
import ScorerSkills from "../components/PageComponents/ScorerSkills";
import ScorerResonance from "../components/PageComponents/ScorerResonance";

const EchoScorer: React.FC = () => {
  const { characters, selectedCharacterId, setSelectedCharacterId, level } =
    useDataContext();
  const [eleImg, setEleImg] = useState<string>("");
  const { echoes } = useEchoContext();
  const { echoStats } = useEchoes();
  const { weaponStats } = useWeapons();
  const { weapons } = useWeaponContext();
  const { charaName } = useParams<{ charaName: string }>();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [position, setPosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [zoom, setZoom] = useState<number>(1);
  const [isEditing, setIsEdititng] = useState(false);
  const shiftIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const divRef = useRef<HTMLDivElement | null>(null);
  const [style, setStyle] = useState<React.CSSProperties>({});

  //Page Dependency
  const chara = Object.values(characters).find(
    (char) => char.charaId === selectedCharacterId
  );

  const cName = Object.values(characters).find(
    (character) => character.name.toLowerCase() === charaName?.toLowerCase()
  );

  useEffect(() => {
    if (cName) {
      setSelectedCharacterId(cName.charaId);
    }
  });

  const [images, setImages] = useState({
    1: "",
    2: "",
    3: "",
    4: "",
    5: "",
    6: "",
    7: "",
    8: "",
  });

  useEffect(() => {
    const echo = Object.values(echoes).find(
      (echo) => echo.name === echoStats[1].name
    )?.img;
    const echo2 = Object.values(echoes).find(
      (echo) => echo.name === echoStats[2].name
    )?.img;
    const echo3 = Object.values(echoes).find(
      (echo) => echo.name === echoStats[3].name
    )?.img;
    const echo4 = Object.values(echoes).find(
      (echo) => echo.name === echoStats[4].name
    )?.img;
    const echo5 = Object.values(echoes).find(
      (echo) => echo.name === echoStats[5].name
    )?.img;
    const weapon = Object.values(weapons).find(
      (weap) => weap.name === weaponStats.name
    )?.img;

    // Only set the images if they exist
    setImages((prevImages) => ({
      ...prevImages,
      1: echo || prevImages[1],
      2: echo2 || prevImages[2],
      3: echo3 || prevImages[3],
      4: echo4 || prevImages[4],
      5: echo5 || prevImages[5],
      6: weapon || prevImages[6],
      7: chara?.images.model || prevImages[7],
      8: imageUrl || prevImages[8],
    }));
  }, [echoes, echoStats, weaponStats, chara, imageUrl]);

  //Image Handling
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const loadImages = async (urls: string[]): Promise<void> => {
    const loadImage = (url: string): Promise<HTMLImageElement> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = url;
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
      });
    };

    await Promise.all(urls.map((url) => loadImage(url)));
  };

  useEffect(() => {
    const loadedImages = Object.values(images).filter((img) => img !== "");
    if (loadedImages.length > 0) {
      setImageUrls(loadedImages);
    }
  }, [images]);

  const downloadDivAsImage = async () => {
    if (divRef.current) {
      setIsLoading(true);

      try {
        await loadImages(imageUrls);

        html2canvas(divRef.current, {
          scale: window.devicePixelRatio * 2,
          useCORS: true,
          logging: true,
          backgroundColor: null,
        })
          .then((canvas) => {
            const dataUrl = canvas.toDataURL("image/png");
            const link = document.createElement("a");
            link.href = dataUrl;
            link.download = `${chara?.name}-Card.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setIsLoading(false);
          })
          .catch((error) => {
            console.error("Failed to capture div:", error);
            setIsLoading(false);
          });
      } catch (error) {
        console.error("Failed to load images:", error);
        setIsLoading(false);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setImageUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageEdit = (state: "Edit" | "Save") => {
    setIsEdititng(state === "Edit" && true);
    if (state === "Save") {
      setIsEdititng(false);
    }
  };

  const shiftImage = (direction: "left" | "right" | "up" | "down") => {
    setPosition((prev) => ({
      x:
        direction === "left"
          ? prev.x - 10
          : direction === "right"
          ? prev.x + 10
          : prev.x,
      y:
        direction === "up"
          ? prev.y - 10
          : direction === "down"
          ? prev.y + 10
          : prev.y,
    }));
  };

  const zoomImage = (direction: "in" | "out") => {
    setZoom((prev) =>
      Math.max(0.1, Math.min(prev + (direction === "in" ? 0.1 : -0.1), 3))
    );
  };

  const handleMouseDown = (direction: "left" | "right" | "up" | "down") => {
    shiftIntervalRef.current = setInterval(() => shiftImage(direction), 100); // Adjust interval as needed
  };

  const handleMouseUp = () => {
    if (shiftIntervalRef.current) {
      clearInterval(shiftIntervalRef.current);
      shiftIntervalRef.current = null;
    }
  };

  const handleMouseLeaveButton = () => {
    handleMouseUp();
  };

  const handleImageReset = () => {
    setImageUrl(null);
    setIsEdititng(false);
    setPosition({ x: 0, y: 0 });
    setZoom(1);
  };

  //Character Elements
  useEffect(() => {
    switch (chara?.element) {
      case "Glacio":
        setEleImg(
          "https://whisperingsea.github.io/wuthering-waves-assets/images/icons_ele/Glacio_3.png"
        );
        break;
      case "Fusion":
        setEleImg(
          "https://whisperingsea.github.io/wuthering-waves-assets/images/icons_ele/Fusion_3.png"
        );
        break;
      case "Electro":
        setEleImg(
          "https://whisperingsea.github.io/wuthering-waves-assets/images/icons_ele/Electro_3.png"
        );
        break;
      case "Aero":
        setEleImg(
          "https://whisperingsea.github.io/wuthering-waves-assets/images/icons_ele/Aero_3.png"
        );
        break;
      case "Spectro":
        setEleImg(
          "https://whisperingsea.github.io/wuthering-waves-assets/images/icons_ele/Spectro_3.png"
        );
        break;
      case "Havoc":
        setEleImg(
          "https://whisperingsea.github.io/wuthering-waves-assets/images/icons_ele/Havoc_3.png"
        );
    }
  }, [chara, setEleImg]);

  //Background for card

  useEffect(() => {
    switch (chara?.element) {
      case "Glacio":
        setStyle((prevStyle) => ({
          ...prevStyle,
          background:
            "linear-gradient(90deg, rgba(22,198,181,1) 20%, rgba(29,72,84,1) 70%, rgba(0,43,36,1) 100%)",
        }));
        break;
      case "Fusion":
        setStyle((prevStyle) => ({
          ...prevStyle,
          background:
            "linear-gradient(90deg, rgba(198,78,22,1) 20%, rgba(84,33,29,1) 70%, rgba(43,18,0,1) 100%)",
        }));
        break;
      case "Aero":
        setStyle((prevStyle) => ({
          ...prevStyle,
          background:
            "linear-gradient(90deg, rgba(41,187,112,1) 20%, rgba(21,139,58,1) 70%, rgba(0,43,14,1) 100%)",
        }));
        break;
      case "Electro":
        setStyle((prevStyle) => ({
          ...prevStyle,
          background:
            "linear-gradient(90deg, rgba(140,22,198,1) 20%, rgba(63,29,84,1) 70%, rgba(27,0,43,1) 100%)",
        }));
        break;
      case "Spectro":
        setStyle((prevStyle) => ({
          ...prevStyle,
          background:
            "linear-gradient(90deg, rgba(222,201,46,1) 20%, rgba(136,118,49,1) 70%, rgba(43,40,0,1) 100%)",
        }));
        break;
      case "Havoc":
        setStyle((prevStyle) => ({
          ...prevStyle,
          background:
            "linear-gradient(90deg, rgba(187,41,76,1) 20%, rgba(139,21,43,1) 70%, rgba(43,0,0,1) 100%)",
        }));
        break;
    }
  }, [chara]);

  return (
    <>
      <div className="echo-scorer-page-container">
        <div className="scorer-background"></div>
        <main>
          <section className="echo-scorer-section">
            <div className="scorer-bar">
              <ScorerBar
                isLoading={isLoading}
                downloadDivAsImage={downloadDivAsImage}
              />
            </div>
            <p className="Scorer-Note">
              <b>
                Important Note: Please check the Scoring Algorithm and makes
                sure all preferred stats are correct. The default stats may not
                align with you build.
              </b>
            </p>
          </section>
          <section className="image-center-div">
            <div className="Scorer-Image-Section">
              <div className="echo-scorer-grid" ref={divRef}>
                <div className="scorer-item-1">
                  {!isEditing && (
                    <div className="scorer-res-box">
                      <ScorerResonance />
                    </div>
                  )}
                  {imageUrl === null ? (
                    <>
                      <label
                        htmlFor="ScorerImgInput"
                        className="custom-file-label"
                      >
                        Add
                      </label>
                      <input
                        className="scorer-img-edit"
                        type="file"
                        id="ScorerImgInput"
                        style={{ display: "none" }}
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                    </>
                  ) : isEditing ? (
                    <button
                      className="custom-file-label"
                      onClick={() => handleImageEdit("Save")}
                    >
                      Save
                    </button>
                  ) : (
                    <button
                      className="custom-file-label"
                      onClick={() => handleImageEdit("Edit")}
                    >
                      Edit
                    </button>
                  )}
                  <button
                    className="scorer-img-reset"
                    onClick={handleImageReset}
                  >
                    Reset
                  </button>
                  {imageUrl ? (
                    <div className="image-container">
                      <img
                        src={imageUrl}
                        style={{
                          position: "absolute",
                          transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                          width: "max-content",
                          height: "100%",
                          scale: 2,
                        }}
                      />
                    </div>
                  ) : (
                    <div className="image-container">
                      <img
                        className="character-image"
                        src={chara?.images.model}
                        style={style}
                      />
                    </div>
                  )}
                  {imageUrl && isEditing && (
                    <div className="controls">
                      <button
                        className="image-manipulation-btn"
                        onClick={() => shiftImage("left")}
                        onMouseDown={() => handleMouseDown("left")}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseLeaveButton}
                      >
                        <b>←</b>
                      </button>
                      <button
                        className="image-manipulation-btn"
                        onClick={() => shiftImage("right")}
                        onMouseDown={() => handleMouseDown("right")}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseLeaveButton}
                      >
                        <b>→</b>
                      </button>
                      <button
                        className="image-manipulation-btn"
                        onClick={() => shiftImage("up")}
                        onMouseDown={() => handleMouseDown("up")}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseLeaveButton}
                      >
                        <b>↑</b>
                      </button>
                      <button
                        className="image-manipulation-btn"
                        onClick={() => shiftImage("down")}
                        onMouseDown={() => handleMouseDown("down")}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseLeaveButton}
                      >
                        <b>↓</b>
                      </button>
                      <button
                        onClick={() => zoomImage("in")}
                        className="image-manipulation-btn"
                      >
                        <b>+</b>
                      </button>
                      <button
                        onClick={() => zoomImage("out")}
                        className="image-manipulation-btn"
                      >
                        <b>-</b>
                      </button>
                    </div>
                  )}
                </div>
                <div className="scorer-item-2">
                  <div className="scorer-top-flexbox">
                    <div>
                      <h3 className={`scorer-chara-name ${chara?.element}`}>
                        {chara?.name}
                      </h3>
                      <div className="scorer-img-flex">
                        <h3 className="scorer-chara-level">{level}/90</h3>
                        <img
                          className="scorer-item-img-element"
                          src={eleImg}
                          alt={`${chara?.element} Icon`}
                        />
                      </div>
                    </div>
                    <div className="scorer-image-flex">
                      <ScorerSkills />
                    </div>
                  </div>
                  <div>
                    <CalcStats Element={chara?.element} />
                  </div>
                  <div>
                    <ScorerWeaponCard />
                  </div>
                </div>
                <div className="scorer-item-3">
                  <ScorerEchoCard Index={1} />
                  <ScorerEchoCard Index={2} />
                  <ScorerEchoCard Index={3} />
                  <ScorerEchoCard Index={4} />
                  <ScorerEchoCard Index={5} />
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

export default EchoScorer;
