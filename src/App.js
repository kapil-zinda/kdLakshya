import logo from './logo.svg';
import './App.css';
import TemporaryDrawer from './components/Drawer';
import Button from '@mui/material/Button';

function App() {
  return (
    <div className="App">
      <TemporaryDrawer/>
      <header className="App-header">
        <div >
        {/* <img src={logo} className="App-logo" alt="logo" /> */}
        <p style={{textAlign: "center"}}>
        No Table
        </p>
       <p style={{textAlign: "center"}}>Create a table and it will show up here 
       
       </p>
      <Button sx={{background: "red", color: "white", alignItems: "center", width: "100%"}}>Create Table</Button>

        </div>
      </header>
    </div>
  );
}

export default App;
