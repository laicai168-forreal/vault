import './NavBar.scss';

import { useState } from 'react';
import { FaChevronDown } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useMatch, createSearchParams, useSearchParams } from 'react-router-dom';

import logo from '../assets/images/logo.png';
import defaultAvatar from '../assets/images/default-avatar.jpg';
import CImage from '../components/common/CImage';
import CSearchInput from '../components/CSearchInput';
import useClickOutside from '../hooks/useClickOutSide';
import { updateFilter } from '../store/filter/filterSlice';
import { AppDispatch, RootState } from '../store/store';
import { signOut } from '../store/auth/authSlice';
import { clearUserState } from '../store/user/userSlice';

export default function NavBar() {
	const navigate = useNavigate();
	const isCars = useMatch("/cars");
	const dispatch = useDispatch<AppDispatch>();

	const { isAuthenticated, authData } = useSelector((state: RootState) => state.auth);
	const { currentUser } = useSelector((state: RootState) => state.user);
	const { filterData: { keyword } } = useSelector((state: RootState) => state.filter);
	const [searchParams, setSearchParams] = useSearchParams();
	const [isDropDownOpened, setIsDropDownOpened] = useState(false);
	const isAdmin = currentUser?.role === 'admin';
	const dropDownPanelRef = useClickOutside<HTMLDivElement>(() => {
		setIsDropDownOpened(false);
	});

	const handleSearchTextChange = (keyword: string) => {
		if (keyword) {
			if (!isCars) {
				navigate({
					pathname: "/cars",
					search: createSearchParams({
						key_word: keyword,
					}).toString(),
				});
			}
			const newParams = new URLSearchParams(searchParams);
			newParams.set('key_word', keyword);
			setSearchParams(newParams);
		}
	}

	const handleLogout = () => {
		dispatch(signOut({ userId: authData?.userData['cognito:username'] }))
			.then(() => {
				localStorage.removeItem("@malo_auth");
				dispatch(clearUserState());
				navigate({
					pathname: "/login",
				});
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
					<CImage src={logo} alt="logo" />
				</Link>
			</div>
			<div className="nav-page-options">
				<Link to="/collection_list" className="nav-option">My Collections</Link>
				<Link to="/cars" className="nav-option">Cars</Link>
				<Link to="/settings" className="nav-option">Settings</Link>

				{/* <Link to="/login" className="hover:text-blue-400">Login</Link> */}
			</div>
			<div className="nav-search">
				<CSearchInput initialValue={keyword} onClick={(keyword) => handleSearchTextChange(keyword)} placeholder='Search Cars...' />
			</div>
			<div className="nav-drop-down" ref={dropDownPanelRef}>
				<button className="nav-option nav-button" onClick={() => setIsDropDownOpened(!isDropDownOpened)}>
					<span className="nav-avatar-frame">
						<img
							className="nav-avatar-image"
							src={currentUser?.profileImageUrl || defaultAvatar}
							alt={currentUser?.username ? `${currentUser.username} profile` : 'Profile'}
						/>
					</span>
					<FaChevronDown size={10} />
				</button>
				<div className={`drop-down-panel${isDropDownOpened ? '' : ' drop-down-panel-closed'}`}>
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
									{
										!isAuthenticated &&
										<button
											className="drop-down-button"
											onClick={
												() => handleDropDownButtonClick(() => navigate('/register'))
											}
										>
											Create an account
										</button>
									}

								</li>
									<li>
										{
											isAuthenticated &&
											<button
												className="drop-down-button"
												onClick={() => handleDropDownButtonClick(() => navigate('/account'))}>
												My Profile
											</button>
										}
									</li>
									<li>
										{
											isAuthenticated && isAdmin &&
											<button
												className="drop-down-button"
												onClick={() => handleDropDownButtonClick(() => navigate('/admin/car-requests'))}>
												Review Suggestions
											</button>
										}
									</li>
									<li>
										{
											isAuthenticated && isAdmin &&
											<button
												className="drop-down-button"
												onClick={() => handleDropDownButtonClick(() => navigate('/admin/cars'))}>
												Admin Maintenance
											</button>
										}
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
