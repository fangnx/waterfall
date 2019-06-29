/**
 * PostView.jsx
 * @author fangnx
 * @description
 * @created 2019-06-14T01:31:06.070Z-04:00
 * @copyright
 * @last-modified 2019-06-25T00:27:25.160Z-04:00
 */

import React from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import ReactMarkdown from 'react-markdown';
import {
	Label,
	Card,
	Grid,
	Icon,
	Input,
	TextArea,
	Modal,
	Button,
	Segment,
	Divider
} from 'semantic-ui-react';
import '../../App.css';
import { ViewPostStyles as styles } from '../ViewPostStyles';
import dateFormat from 'dateformat';
import { addComment, getAllCommentsOfPost } from '../../actions/postActions';
import { getAvatarData } from '../../actions/loginSignoutActions';
import UserLabel from '../Header/UserLabel';
import CommentSection from './CommentSection';
import { TAG_COLORS, mergeStyles } from '../../utils/commonUtils';

class PostView extends React.Component {
	constructor() {
		super();
		this.state = {
			authorAvatar: '',
			comments: [],
			newCommentContent: '',
			shouldRedirect: false
		};
		this.directToEditPost = this.directToEditPost.bind(this);
	}

	capitalizeTag(word) {
		return word.charAt(0).toUpperCase() + word.slice(1);
	}

	directToEditPost() {
		this.setState({ shouldEdit: true });
	}

	deleteModalClose = () => {
		this.setState({ deleteModalOpened: false });
	};

	onChange = (e, data) => {
		this.setState({ [data.id]: data.value });
	};

	onDelete = e => {
		e.preventDefault();
		this.setState({ deleteModalOpened: true });
		// deletePost({ pid: this.props.pid }).then();
	};

	onAddComment = e => {
		e.preventDefault();

		const newComment = {
			content: this.state.newCommentContent,
			pid: this.props.pid,
			author: this.props.auth.user.name,
			authorEmail: this.props.auth.user.email,
			timeStamp: dateFormat(new Date(), 'isoDateTime')
		};

		addComment(newComment).then(res => {
			if (res.status === 200) {
				this.setState({ success: true });
			}
		});
	};

	componentDidMount = async () => {
		await getAvatarData({ email: this.props.authorEmail })
			.then(res => {
				if (res.data.avatar) {
					this.setState({ authorAvatar: res.data.avatar });
				} else {
					this.setState({ authorAvatar: '' });
				}
			})
			.catch(err => console.log(err));
		await getAllCommentsOfPost({ pid: this.props.pid }).then(res => {
			if (res.data) {
				this.setState({ comments: res.data.map(comment => comment) });
			}
		});
	};

	render() {
		const { pid, title, content, timeStamp, tags } = this.props;
		if (this.state.shouldEdit) {
			this.props.dispatch({
				type: 'EDIT_POST',
				payload: { pid, title, content, timeStamp, tags }
			});
			this.props.history.push({
				pathname: '/post/edit'
			});
		}
		return (
			<div style={styles.wrapper}>
				<Card style={styles.card} fluid>
					<Card.Content style={styles.cardContent}>
						<Grid padded>
							<Grid.Row columns={2} style={mergeStyles([styles.field])}>
								<Grid.Column style={styles.column} width={14}>
									<UserLabel
										userName={this.props.author}
										userAvatar={this.state.authorAvatar}
									/>
								</Grid.Column>

								<Grid.Column style={styles.column} width={2}>
									{this.props.canManage ? (
										<div style={styles.iconGroup}>
											<Icon
												size="large"
												onClick={this.directToEditPost}
												name="pencil"
												style={styles.icon}
											/>
											&nbsp;
											<Icon
												size="large"
												onClick={this.onDelete}
												name="close"
												color="red"
												style={styles.icon}
											/>
										</div>
									) : (
										''
									)}
								</Grid.Column>
							</Grid.Row>
							<Divider
								style={{
									background: 'rgba(228, 228, 228, 0.2)',
									marginLeft: 0,
									marginRight: 0
								}}
							/>
							<Grid.Row style={mergeStyles([styles.field, styles.title])}>
								{this.props.title}
							</Grid.Row>
							<Grid.Row>
								<Segment style={mergeStyles([styles.field, styles.content])}>
									<ReactMarkdown source={this.props.content} />
								</Segment>
							</Grid.Row>
							<Grid.Row className="postView-tags-field">
								<Label.Group size="medium" className="postView-tagList">
									{this.props.tags.map((tag, index) => (
										<Label
											className="postView-tag"
											key={'postView-tag-' + index}
											color={TAG_COLORS[index % TAG_COLORS.length]}
										>
											{this.capitalizeTag(tag)}
										</Label>
									))}
								</Label.Group>
							</Grid.Row>
							<Divider
								style={{
									background: 'rgba(228, 228, 228, 0.2)',
									marginLeft: 0,
									marginRight: 0
								}}
							/>{' '}
							{this.state.comments.length ? (
								<Grid.Row>
									<CommentSection comments={this.state.comments} />
								</Grid.Row>
							) : (
								''
							)}
							<Grid.Row>
								<TextArea
									as={Input}
									id="newCommentContent"
									value={this.state.newCommentContent}
									onChange={this.onChange}
									placeholder="Write your comment: "
									rows="2"
									icon={
										<Button icon style={{ background: 'transparent' }}>
											<Icon
												name="talk"
												size="large"
												onClick={this.onAddComment}
											/>
										</Button>
									}
									style={{
										width: '100%',
										background: 'rgba(245, 245, 245)',
										border: '1px solid #ddd',
										boxShadow: 'none'
									}}
								/>
							</Grid.Row>
						</Grid>

						<Modal>
							open={this.state.deleteModalOpened}
							onClose={this.deleteModalClose}>
							<Modal.Header>Deleting your post</Modal.Header>
							<Modal.Content image>
								<p>Are you sure you would like to have this post removed?</p>
							</Modal.Content>
							<Modal.Actions>
								<Button
									positive
									content="Nope, I would keep it :)"
									color="black"
									onClick={this.deleteModalClose}
								/>
								<Button
									negative
									icon="checkmark"
									labelPosition="right"
									content="Yes, delete it"
									onClick={this.deleteModalClose}
								/>
							</Modal.Actions>
						</Modal>
					</Card.Content>
				</Card>
			</div>
		);
	}
}

const mapStateToProps = state => ({ auth: state.auth });

export default connect(mapStateToProps)(withRouter(PostView));
