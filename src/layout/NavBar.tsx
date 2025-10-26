import { Link, useNavigate } from "react-router-dom";
import { AppDispatch, RootState } from "../store/store";
import { useSelector } from "react-redux";
import { FaChevronDown, FaUser } from "react-icons/fa";
import "../styles/NavBar.scss"
import { useState } from "react";
import useClickOutside from "../hooks/useClickOutSide";
import { useDispatch } from "react-redux";
import { signOut } from "../store/auth/authSlice";

export default function NavBar() {
	const navigate = useNavigate();
	const dispatch = useDispatch<AppDispatch>();

	const { isAuthenticated, authData } = useSelector((state: RootState) => state.auth);
	const [isDropDownOpened, setIsDropDownOpened] = useState(false);
	const dropDownPanelRef = useClickOutside<HTMLDivElement>(() => {
		setIsDropDownOpened(false);
	});

	const handleLogout = () => {
		dispatch(signOut({ userId: authData?.userData['cognito:username'] })).then(() => {
			localStorage.removeItem("@malo_auth");
		});
	};

	const handleDropDownButtonClick = (cb: () => void) => {
		cb();
		setIsDropDownOpened(false);
	}

	return (
		<nav className="nav">
			<div>
				<Link to="/home" className="nav-option nav-logo-option" >
					LOGO TBD
				</Link>
			</div>
			<div className="nav-page-options">
				<Link to="/home" className="nav-option">Dashboard</Link>
				<Link to="/all" className="nav-option">Cars</Link>
				<Link to="/settings" className="nav-option">Settings</Link>

				{/* <Link to="/login" className="hover:text-blue-400">Login</Link> */}
			</div>
			<div ref={dropDownPanelRef}>
				<button className="nav-option nav-button" onClick={() => setIsDropDownOpened(!isDropDownOpened)}>
					<FaUser /><FaChevronDown size={10} />
				</button>
				<div className="drop-down-panel">
					{
						isDropDownOpened &&
						<div>
							<ul>
								{
									!isAuthenticated &&
									<li>
										<button
											className="drop-down-button"
											onClick={
												() => handleDropDownButtonClick(() => navigate('/login'))
											}
										>
											Log in
										</button>
									</li>
								}

								<li>
									<button className="drop-down-button">Create an account</button>
								</li>
								<li>
									{
										isAuthenticated &&
										<button
											className="drop-down-button"
											onClick={() => handleDropDownButtonClick(() => handleLogout())}>
											Log out
										</button>
									}
								</li>
							</ul>
						</div>
					}
				</div>
			</div>
		</nav>
	);
}
