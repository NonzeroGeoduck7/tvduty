import PropTypes from "prop-types";

function SeriesElement(props) {
  return (
    <div className="series">
      <span>{props.name}</span>
    </div>
  );
}

Contact.propTypes = {
  name: PropTypes.string.isRequired
};
