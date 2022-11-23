import { useSignal, useSignalEffect } from "@preact/signals";
import { TCPRequestResponse } from "../connection/request_response.ts";
import { ActionType } from "../protocol/action_result.ts";
import { FriendStatus } from "../protocol/request_response.ts";
import AddFriend from "./addFriend.tsx";
import { state, wsC2SConnection, wsP2PConnections } from "./state.ts";

export default function Dash() {
	const addFriend = useSignal("");
	useSignalEffect(() => {
		wsC2SConnection.send({ type: ActionType.SYNC });
	});
	if (addFriend.value == "true") {
		return <AddFriend />;
	}
	return (
		<div>
			<button
				onClick={() => {
					addFriend.value = "true";
				}}
			>
				Kết bạn
			</button>
			<ul>
				{state.friends.value.map((friend) => {
					const status = (friend.state.type ? "Online" : "Offline");
					const message = useSignal("");
					const block = "myForm" + friend.username;
					if (
						!wsP2PConnections.get(friend.username) &&
						friend.state.type === FriendStatus.ONLINE
					) {
						wsC2SConnection.send({
							type: ActionType.CONNECT,
							username: friend.username,
						});
					}

					return (
						<div>
							<p></p>
							<button
								onClick={() => {
									const send = document.getElementById(
										block,
									)!;
									if (send.style.display === "none") {
										send.style.display = "block";
									} else {
										send.style.display = "none";
									}
								}}
							>
								{friend.username}
							</button>{" "}
							<b>{status}</b>
							<div></div>
							<div
								class="chat-popup"
								id={block}
								style="display: none"
							>
								<ul>
									{
										/* run fail. I want show dialog. Can help ?*/
										state.dialogs.value.get(
											friend.username,
										)!.map(
											(item) => {
												return (
													<div>
														<b>{item}</b>
													</div>
												);
											},
										)
									}
								</ul>
								<label>
									<input
										type="message"
										value={message}
										onInput={(e) =>
											message.value =
												e.currentTarget.value}
									/>
								</label>
								<button
									onClick={() => {
										wsP2PConnections.get(friend.username)!
											.send(
												{
													type:
														ActionType.SEND_MESSAGE,
													content: message.value,
												},
											);
										state.dialogs.value.get(
											friend.username,
										)!
											.push("me:" + message.value);
										console.log(
											"dialog",
											state.dialogs.value.get(
												friend.username,
											)!,
										);
									}}
								>
									Send
								</button>
							</div>
						</div>
					);
				})}
			</ul>
		</div>
	);
}
