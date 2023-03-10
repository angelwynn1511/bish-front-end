import React from "react";
import Slider from "@material-ui/core/Slider";
import { withStyles } from "@material-ui/core";
import cross from "../../assets/images/cross.png";

const CustomSlider = withStyles({
  root: {
    color: "#2EB7EB",
    height: 12,
    padding: "13px 0",
  },
  rail: {
    height: 12,
    color: "#2EB7EB",
  },
  thumb: {
    height: 24,
    width: 24,
    marginTop: -6,
  },
  track: {
    color: "#0d5aa7",
  },
})(Slider);

const marks = [
  {
    value: 0,
    label: "0€",
  },
  {
    value: 200,
    label: "200€",
  },
];

const CheckBox = ({ label, typeCheck, name, onChange, value }) => {
  return (
    <>
      <input
        className="w-6 h-6 rounded-full"
        type={typeCheck}
        name={name}
        onChange={onChange}
        value={value}
      />
      <label className="ml-3">{label}</label>
    </>
  );
};

const Filtre = (props) => {
  const [checkedAsc, setCheckedAsc] = React.useState(false);
  const [checkedDesc, setCheckedDesc] = React.useState(false);
  const [checkedNote, setCheckedNote] = React.useState(false);

  const [value, setValue] = React.useState([0, 20]);
  const [oldValue, setoldValue] = React.useState([]);
  let timer;

  const rangeSelector = (event, newValue) => {
    setValue(newValue)
    setoldValue(value);
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      timer = null;
      if (oldValue === newValue) {
        props.priceRangeFilter(newValue);
      }
    }, 2000);
  };

  const handleChangeAsc = () => {
    setCheckedAsc(!checkedAsc);
    setCheckedDesc(false);
    if (checkedNote) {
      props.filter("ASC", true);
    } else {
      props.filter("ASC", false);
    }
  };

  const handleChangeDesc = () => {
    setCheckedDesc(!checkedDesc);
    setCheckedAsc(false);
    if (checkedNote) {
      props.filter("DESC", true);
    } else {
      props.filter("DESC", false);
    }
  };

  const handleChangeNote = () => {
    setCheckedNote(!checkedNote);
    if (document.getElementsByName("orderByNote")[0].checked) {
      if (checkedAsc) {
        props.filter("ASC", true);
      } else if (checkedDesc) {
        props.filter("DESC", true);
      } else {
        props.filter(null, true);
      }
    } else {
      if (checkedAsc) {
        props.filter("ASC", false);
      } else if (checkedDesc) {
        props.filter("DESC", false);
      } else {
        props.filter(null, false);
      }
    }
  };

  const handleChangeSize = (event) => {
    props.setSize(event.target.value)
  }

  return (
    <div className="mt-24">
      <img
        src={cross}
        onClick={props.closeFilter}
        className="w-7 cursor-pointer absolute top-16 right-3"
        alt="cross"
      />
      <p className="bish-text-gray text-3xl mb-3">Trier par</p>
      <ul className="flex flex-col space-y-3">
        <li>
          <CheckBox
            label="Prix: par ordre croissant"
            typeCheck="radio"
            onChange={() => handleChangeAsc()}
            value={checkedAsc}
            name="orderByPrice"
          />
        </li>
        <li>
          <CheckBox
            label="Prix: par ordre décroissant"
            typeCheck="radio"
            value={checkedDesc}
            onChange={() => handleChangeDesc()}
            name="orderByPrice"
          />
        </li>
        {/* <li>
          <CheckBox
            label="Note moyenne"
            typeCheck="checkbox"
            value={checkedNote}
            onChange={() => handleChangeNote()}
            name="orderByNote"
          />
        </li> */}
      </ul>

      <div className="">
        <p className="bish-text-gray text-3xl my-3">Filtre par</p>
        <div className="flex justify-center">
          <span className="mr-3 whitespace-nowrap mt-1 bish-text-gray">
            Prix :{" "}
          </span>
          <CustomSlider
            value={value}
            step={10}
            min={0}
            max={200}
            onChange={rangeSelector}
            valueLabelDisplay="auto"
            marks={marks}
          />
        </div>
        <div className="flex flex-col">
          <span className="mr-3 whitespace-nowrap mt-1 bish-text-gray"></span>
            Tailles disponibles:
          <div className="w-full flex gap-1 my-4">
            <button className="w-1/5 mx-auto rounded font-medium box-border h-8 p-1 text-center bish-bg-blue bish-text-white hover:bish-bg-white hover:border hover:bish-border-gray hover:text-black" onClick={handleChangeSize} value="XS">XS</button>
            <button className="w-1/5 mx-auto rounded font-medium box-border h-8 p-1 text-center bish-bg-blue bish-text-white hover:bish-bg-white hover:border hover:bish-border-gray hover:text-black" onClick={handleChangeSize} value="S">S</button>
            <button className="w-1/5 mx-auto rounded font-medium box-border h-8 p-1 text-center bish-bg-blue bish-text-white hover:bish-bg-white hover:border hover:bish-border-gray hover:text-black" onClick={handleChangeSize} value="M">M</button>
            <button className="w-1/5 mx-auto rounded font-medium box-border h-8 p-1 text-center bish-bg-blue bish-text-white hover:bish-bg-white hover:border hover:bish-border-gray hover:text-black" onClick={handleChangeSize} value="L">L</button>
            <button className="w-1/5 mx-auto rounded font-medium box-border h-8 p-1 text-center bish-bg-blue bish-text-white hover:bish-bg-white hover:border hover:bish-border-gray hover:text-black" onClick={handleChangeSize} value="XL">XL</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Filtre;
