import React from 'react';
import PropTypes from 'prop-types'
import Layout from '../layout-min'
import classNames from 'classnames'

function countTo(n) {
	var a = [];
	for (var i = 0; i < n; i++) {
		a.push(i + 1);
	}
	return a.join(', ');
}

class Index extends React.Component {
	render() {
		let app = this.props
		return (
			<Layout app={app}>
				<h1>{app.title}</h1>
				<p>Welcome to {app.title}</p>
				<p>
					I can count to 10: {countTo(10)}
				</p>
			</Layout>
		);
	}
}

Index.propTypes = {
	title: PropTypes.string.isRequired,
	_csrf: PropTypes.string.isRequired,
};

export default Index;
