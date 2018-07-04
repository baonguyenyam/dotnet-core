import React from 'react';
import serialize from 'serialize-javascript';

class Layout extends React.Component {
	render() {
		const { app, children } = this.props;
		let bodyClassName = 'app-';
		if (app.title) {
			bodyClassName += app.title.toLowerCase();
		}
		return (
			<html className="no-js" lang="en">
				<head>
					<meta charSet="utf-8" />
					<meta httpEquiv="X-UA-Compatible" content="IE=edge" />
					<meta name="viewport" content="width=device-width, initial-scale=1.0" />
					<meta name="theme-color" content="#4DA5F4" />
					<meta name="csrf-token" content={app._csrf} />
					<meta name="description" content={app.description} />
					<title>{app.title} - Demo</title>
					<link rel="shortcut icon" href="/favicon.png" />
					<link rel="stylesheet" href="/css/core.css" />
					<link rel="stylesheet" href="/css/main.css" />
					<script
						dangerouslySetInnerHTML={{
							__html: `console.log("hello world");`,
						}}
					/>
				</head>
				<body className={bodyClassName}>
					{children}
					<script
						dangerouslySetInnerHTML={{ __html: `window.nguyenApp=${serialize(app)}` }}
					/>
					<script src="/js/core.js"></script>
					<script src="/js/main.js"></script>
				</body>
			</html>
		);
	}
}

export default Layout;
