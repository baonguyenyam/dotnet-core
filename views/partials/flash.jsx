import React from 'react';

class Flash extends React.Component {
	render() {
		let app = this.props
		return (
			<Layout app={app}>
				<div class="alert alert-danger fade show"><button class="close" type="button" data-dismiss="alert"><i class="far fa-times-circle"></i></button></div>
				<div class="alert alert-info fade show"><button class="close" type="button" data-dismiss="alert"><i class="far fa-times-circle"></i></button></div>
				<div class="alert alert-success fade show"><button class="close" type="button" data-dismiss="alert"><i class="far fa-times-circle"></i></button></div>
			</Layout>
		);
	}
}

export default Flash;
