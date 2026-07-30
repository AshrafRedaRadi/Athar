import Avatar from "./Avatar";

function User(props) {
    return (
        <label
            htmlFor="sidebar-drawer"
            className="drawer-button fixed top-3 right-3 cursor-pointer"
        >
            <Avatar src={props.user} />
        </label>
    )
}
export default User;