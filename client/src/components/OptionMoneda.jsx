/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable react/prop-types */
const OptionMoneda = ({ coin, onClick }) => {
	return (
		<a href="#" className="option" onClick={e => onClick(e, coin.id)}>
			<div className="content-option">
				<img className="option-image" src={coin.image} alt={coin.name} />
				<div className="texts">
					<h2 className="title">{coin.name}</h2>
					<div className="option-characteristics">
						<div className="option-characteristic">
							<p className="name">Price</p>
							<p className="value">${Math.floor(coin.current_price * 1000) / 1000}</p>
						</div>
						<div className="option-characteristic">
							<p className="name">Price Change</p>
							<p className={`value ${coin.price_change_24h > 0 ? 'green' : 'red'}`}>{Math.floor(coin.price_change_24h * 1000) / 1000}</p>
						</div>
						<div className="option-characteristic">
							<p className="name">Volume</p>
							<p className="value">${Math.floor(coin.total_volume * 1000) / 1000}</p>
						</div>
					</div>
				</div>
			</div>
		</a>
	)
}

export default OptionMoneda