import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";


export default function HomePage(){

  return (
    <>
      <div>
        <a>
          <img src="/assets/SEALAN.gif" alt="SEALAN logo" />
        </a>
      </div>
      <h1>S.E.A LAN tournament viewer!!11!!</h1>
      <div> 
      < ButtonList buttons={TournamentButtons}/>
      </div>
    </>
  )
}

interface TournamentButton {
  logo: string;
  game: string;
  link: string;
}
const TournamentButtons: TournamentButton[] = [
  { logo: "/assets/LoL.png", game: "League Of Legends", link: "/lol" },
  { logo: "/assets/valorant.png", game: "Valorant", link: "/valorant"},
  { logo: "/assets/cs2.png", game: "Counter Strike 2", link: "/cs2"}
]

interface ButtonListReq {
  buttons: TournamentButton[];
}

const ButtonList: React.FC<ButtonListReq> = ({buttons}) => {
   return (
    <div className="button-list">
      { buttons.map((btn, idx) => (
        <Link
        key = {idx}
        to = {btn.link}
        className = "button"
        >
        <img src={btn.logo} alt={btn.game} className="button-logo" />
        <span>{btn.game}</span>
        </Link>
  ))}
    </div>
   )
}


