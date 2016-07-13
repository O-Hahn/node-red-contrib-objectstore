import Promise from 'bluebird';
import AuthenticationError from './authentication-error';
import _Request from 'request';

const authUrl = 'https://identity.open.softlayer.com/v3/auth/tokens';

function Request(options, os){
  return R(options).catch(AuthenticationError, e => {
    os.credentials.auth.identity.password.user.id = os.userId;
    os.credentials.auth.identity.password.user.password = os.password;
    os.credentials.auth.scope.project.id = os.projectId;
    const authOptions = {url: authUrl, method: 'post', body: os.credentials, json: true};
    return R(authOptions).then(({response, body}) => {
      os.token = options.headers['x-auth-token'] = response.headers['x-subject-token'];
      return R(options);
    });
  });

  function R(options){
    return new Promise((resolve, reject) => {
      _Request(options, (err, response, body) => {
        if(err){
          reject({err, response});
        }else if(response.statusCode === 401){
          reject(new AuthenticationError());
        }else{
          resolve({response, body});
        }
      });
    });
  }
}

module.exports = Request;
