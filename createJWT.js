const jwt = require("jsonwebtoken");
require("dotenv").config();

// Make _createToken local
const _createToken = function (fn, ln, id) 
{
  try 
  {
    const user = {userId: id, firstName: fn, lastName: ln};
        
    // Add expiration for verification tokens
    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '24h' });
        
    return {accessToken: accessToken};
    } 
    catch(e) 
    {
      return {error: e.message};
    }
}

exports.createToken = function ( fn, ln, id )
{
  return _createToken( fn, ln, id );
}

exports.verifyToken = function(token) 
{
  try 
  {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    return decoded;
  } 
  catch (error) 
  {
    throw new Error('Invalid token: ' + error.message);
  }
}

exports.isExpired = function( token )
{
  try 
  {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    return false;
  } 
  catch(err) 
  {
    return true;
  }
}

exports.refresh = function( token )
{
  const ud = jwt.decode(token,{complete:true});

  var userId = ud.payload.id || ud.payload.userId;
  var firstName = ud.payload.firstName;
  var lastName = ud.payload.lastName;

  if (!userId) 
  {
    throw new Error('Invalid token: no user ID found');
  }

  return _createToken( firstName, lastName, userId );
}
